import { pool } from "../config/db.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener estadísticas del usuario
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active_courses,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_courses,
        COALESCE(AVG(CASE WHEN e.status = 'active' THEN e.progress END), 0) as avg_progress,
        COUNT(ua.id) as total_activities
      FROM enrollments e
      LEFT JOIN user_activities ua ON ua.user_id = e.user_id
      WHERE e.user_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // Obtener cursos en progreso
    const coursesInProgressQuery = `
      SELECT 
        c.id, c.title, c.short_description, c.level, c.duration_hours,
        e.progress, e.enrolled_at,
        cc.name as category_name
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      LEFT JOIN course_categories cc ON cc.id = c.category_id
      WHERE e.user_id = $1 AND e.status = 'active'
      ORDER BY e.enrolled_at DESC
      LIMIT 6
    `;

    const coursesInProgressResult = await pool.query(coursesInProgressQuery, [userId]);

    // Obtener cursos disponibles (no inscritos)
    const availableCoursesQuery = `
      SELECT 
        c.id, c.title, c.short_description, c.level, c.duration_hours, c.price,
        cc.name as category_name
      FROM courses c
      LEFT JOIN course_categories cc ON cc.id = c.category_id
      WHERE c.status = 'published' 
        AND c.id NOT IN (
          SELECT course_id FROM enrollments WHERE user_id = $1
        )
      ORDER BY c.created_at DESC
      LIMIT 6
    `;

    const availableCoursesResult = await pool.query(availableCoursesQuery, [userId]);

    // Obtener actividades recientes
    const activitiesQuery = `
      SELECT 
        ua.activity_type, ua.description, ua.created_at,
        c.title as course_title
      FROM user_activities ua
      LEFT JOIN courses c ON c.id = ua.related_course_id
      WHERE ua.user_id = $1
      ORDER BY ua.created_at DESC
      LIMIT 10
    `;

    const activitiesResult = await pool.query(activitiesQuery, [userId]);

    // Obtener noticias recientes
    const newsQuery = `
      SELECT 
        id, title, summary, published_at, image_url
      FROM news
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 5
    `;

    const newsResult = await pool.query(newsQuery);

    // Formatear respuesta
    const response = {
      user: req.user,
      summary: {
        activeCourses: parseInt(stats.active_courses),
        completedCourses: parseInt(stats.completed_courses),
        averageProgress: parseFloat(stats.avg_progress).toFixed(1),
        totalActivities: parseInt(stats.total_activities)
      },
      stats: [
        {
          id: 'progress',
          title: 'Progreso promedio',
          value: `${parseFloat(stats.avg_progress).toFixed(0)}%`,
          caption: 'Tu avance en cursos activos',
          tone: 'positive'
        },
        {
          id: 'courses',
          title: 'Cursos activos',
          value: stats.active_courses.toString(),
          caption: 'Cursos en los que estás inscrito',
          tone: 'neutral'
        },
        {
          id: 'completed',
          title: 'Cursos completados',
          value: stats.completed_courses.toString(),
          caption: 'Cursos que has terminado',
          tone: 'positive'
        },
        {
          id: 'activities',
          title: 'Actividades',
          value: stats.total_activities.toString(),
          caption: 'Total de actividades registradas',
          tone: 'neutral'
        }
      ],
      coursesInProgress: coursesInProgressResult.rows.map(course => ({
        id: course.id,
        title: course.title,
        description: course.short_description,
        level: course.level,
        duration: `${course.duration_hours}h`,
        progress: parseFloat(course.progress),
        category: course.category_name,
        enrolledAt: course.enrolled_at
      })),
      availableCourses: availableCoursesResult.rows.map(course => ({
        id: course.id,
        title: course.title,
        description: course.short_description,
        level: course.level,
        duration: `${course.duration_hours}h`,
        price: parseFloat(course.price),
        category: course.category_name
      })),
      activity: activitiesResult.rows.map(activity => ({
        type: activity.activity_type,
        description: activity.description,
        courseTitle: activity.course_title,
        timestamp: activity.created_at
      })),
      news: newsResult.rows.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        publishedAt: item.published_at,
        imageUrl: item.image_url
      }))
    };

    res.json(response);
  } catch (error) {
    console.error("Error obteniendo datos del dashboard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener información del usuario con configuraciones
    const userQuery = `
      SELECT 
        u.id, u.name, u.lastname, u.email, u.role, u.created_at,
        us.theme, us.language, us.notifications_enabled, us.email_notifications, us.auto_save
      FROM users u
      LEFT JOIN user_settings us ON us.user_id = u.id
      WHERE u.id = $1
    `;

    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];

    // Obtener estadísticas del perfil
    const profileStatsQuery = `
      SELECT 
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.course_id END) as completed_courses,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.course_id END) as enrolled_courses,
        SUM(CASE WHEN e.status = 'completed' THEN c.duration_hours ELSE 0 END) as total_study_time,
        COUNT(DISTINCT ua.id) as total_activities
      FROM enrollments e
      LEFT JOIN courses c ON c.id = e.course_id
      LEFT JOIN user_activities ua ON ua.user_id = e.user_id
      WHERE e.user_id = $1
    `;

    const profileStatsResult = await pool.query(profileStatsQuery, [userId]);
    const profileStats = profileStatsResult.rows[0];

    // Obtener progreso reciente
    const recentProgressQuery = `
      SELECT 
        lp.completed_at,
        l.title as lesson_title,
        c.title as course_title
      FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id
      JOIN courses c ON c.id = l.course_id
      WHERE lp.user_id = $1 AND lp.completed = true
      ORDER BY lp.completed_at DESC
      LIMIT 5
    `;

    const recentProgressResult = await pool.query(recentProgressQuery, [userId]);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      settings: {
        theme: user.theme || 'dark',
        language: user.language || 'es',
        notifications: user.notifications_enabled !== false,
        email_notifications: user.email_notifications !== false,
        auto_save: user.auto_save !== false
      },
      stats: {
        completed_courses: parseInt(profileStats.completed_courses || 0),
        enrolled_courses: parseInt(profileStats.enrolled_courses || 0),
        total_study_time: parseInt(profileStats.total_study_time || 0),
        total_activities: parseInt(profileStats.total_activities || 0)
      },
      recentProgress: recentProgressResult.rows
    });
  } catch (error) {
    console.error("Error obteniendo perfil del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, language, notifications, email_notifications, auto_save } = req.body;

    const updateQuery = `
      INSERT INTO user_settings (user_id, theme, language, notifications_enabled, email_notifications, auto_save, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        theme = EXCLUDED.theme,
        language = EXCLUDED.language,
        notifications_enabled = EXCLUDED.notifications_enabled,
        email_notifications = EXCLUDED.email_notifications,
        auto_save = EXCLUDED.auto_save,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      userId,
      theme || 'dark',
      language || 'es',
      notifications !== false,
      email_notifications !== false,
      auto_save !== false
    ]);

    res.json({
      message: "Configuración actualizada correctamente",
      settings: result.rows[0]
    });
  } catch (error) {
    console.error("Error actualizando configuración:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener cursos activos del usuario
export const getActiveCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Consulta para obtener cursos activos del usuario
    const coursesQuery = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.instructor,
        c.duration,
        c.level,
        c.category,
        c.image_url,
        c.created_at,
        ue.enrolled_at,
        ue.progress,
        ue.status,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN ul.completed_at IS NOT NULL THEN 1 END) as completed_lessons
      FROM courses c
      INNER JOIN user_enrollments ue ON c.id = ue.course_id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = $1
      WHERE ue.user_id = $1 
        AND ue.status = 'active'
        AND c.status = 'published'
      GROUP BY c.id, c.title, c.description, c.instructor, c.duration, 
               c.level, c.category, c.image_url, c.created_at, 
               ue.enrolled_at, ue.progress, ue.status
      ORDER BY ue.enrolled_at DESC
    `;

    const result = await pool.query(coursesQuery, [userId]);

    res.json({
      courses: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error("Error obteniendo cursos activos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};