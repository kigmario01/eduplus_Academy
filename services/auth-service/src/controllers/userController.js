import pool from '../config/db.js';

// Controlador para rutas de usuario
export const getUserSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener información del usuario
    const userQuery = await pool.query(`
      SELECT id, name, lastname, email, role, avatar, created_at
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    const user = userQuery.rows[0];

    // Obtener estadísticas de cursos completados
    const completedCoursesQuery = await pool.query(`
      SELECT COUNT(*) as completed_courses
      FROM course_enrollments 
      WHERE user_id = $1 AND status = 'completed'
    `, [userId]);

    // Obtener total de cursos inscritos
    const enrolledCoursesQuery = await pool.query(`
      SELECT COUNT(*) as enrolled_courses
      FROM course_enrollments 
      WHERE user_id = $1
    `, [userId]);

    // Obtener certificados
    const certificatesQuery = await pool.query(`
      SELECT COUNT(*) as certificates
      FROM course_enrollments 
      WHERE user_id = $1 AND certificate_issued = true
    `, [userId]);

    // Obtener puntos totales de actividades
    const pointsQuery = await pool.query(`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM user_activities 
      WHERE user_id = $1
    `, [userId]);

    // Obtener logros recientes
    const achievementsQuery = await pool.query(`
      SELECT id, title, earned_at as date
      FROM user_achievements 
      WHERE user_id = $1
      ORDER BY earned_at DESC
      LIMIT 5
    `, [userId]);

    // Calcular horas estudiadas basado en progreso de lecciones
    const hoursQuery = await pool.query(`
      SELECT COALESCE(SUM(time_spent), 0) / 60.0 as hours_studied
      FROM lesson_progress 
      WHERE user_id = $1
    `, [userId]);

    const completedCourses = parseInt(completedCoursesQuery.rows[0].completed_courses);
    const certificates = parseInt(certificatesQuery.rows[0].certificates);
    const totalPoints = parseInt(pointsQuery.rows[0].total_points);
    const hoursStudied = parseFloat(hoursQuery.rows[0].hours_studied) || 0;

    // Obtener streak actual del usuario
    const streakQuery = await pool.query(`
      SELECT current_streak, weekly_goal, weekly_progress
      FROM user_stats 
      WHERE user_id = $1
    `, [userId]);

    const currentStreak = streakQuery.rows[0]?.current_streak || 0;
    const weeklyGoal = streakQuery.rows[0]?.weekly_goal || 10;
    const weeklyProgress = streakQuery.rows[0]?.weekly_progress || 0;

    res.json({
      hoursStudied: parseFloat(hoursStudied.toFixed(1)),
      completedCourses,
      certificates,
      points: totalPoints,
      user: {
        id: user.id,
        name: user.lastname ? `${user.name} ${user.lastname}` : user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      currentStreak,
      weeklyGoal,
      weeklyProgress: parseFloat(weeklyProgress.toFixed(1)),
      recentAchievements: achievementsQuery.rows
    });
  } catch (error) {
    console.error('Error getting user summary:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el resumen del usuario'
    });
  }
};

export const getUserCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    let whereClause = 'WHERE ce.user_id = $1';
    let params = [userId];
    let paramCount = 1;

    // Filtro por estado
    if (status !== 'all') {
      paramCount++;
      whereClause += ` AND ce.status = $${paramCount}`;
      params.push(status);
    }

    const offset = (page - 1) * limit;

    // Consulta para obtener cursos del usuario con información del curso
    const coursesQuery = `
      SELECT 
        ce.course_id as id,
        ce.progress,
        ce.status,
        ce.enrolled_at,
        ce.last_accessed,
        ce.completed_at,
        ce.certificate_issued,
        ce.certificate_id,
        -- Información del curso (simulada desde course-service)
        'Curso ' || ce.course_id as title,
        'Descripción del curso ' || ce.course_id as description,
        'Instructor ' || (ce.course_id % 5 + 1) as instructor,
        '/images/course-' || ce.course_id || '.jpg' as thumbnail,
        (10 + (ce.course_id % 20)) || ' horas' as duration,
        (ce.course_id % 30 + 10) as lessons,
        CASE 
          WHEN ce.course_id % 4 = 0 THEN 'Programación'
          WHEN ce.course_id % 4 = 1 THEN 'Diseño'
          WHEN ce.course_id % 4 = 2 THEN 'Marketing'
          ELSE 'Negocios'
        END as category
      FROM course_enrollments ce
      ${whereClause}
      ORDER BY ce.enrolled_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    // Consulta para contar total de cursos
    const countQuery = `
      SELECT COUNT(*) as total
      FROM course_enrollments ce
      ${whereClause}
    `;

    const [coursesResult, countResult] = await Promise.all([
      pool.query(coursesQuery, params),
      pool.query(countQuery, params.slice(0, paramCount))
    ]);

    // Calcular lecciones completadas basado en el progreso
    const coursesWithProgress = coursesResult.rows.map(course => {
      const completedLessons = Math.floor((course.progress / 100) * course.lessons);
      return {
        ...course,
        progress: parseFloat(course.progress),
        completedLessons,
        lastAccessed: course.last_accessed ? course.last_accessed.toISOString().split('T')[0] : null,
        certificateId: course.certificate_issued ? course.certificate_id : undefined
      };
    });

    const total = parseInt(countResult.rows[0].total);

    res.json({
      items: coursesWithProgress,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error getting user courses:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los cursos del usuario'
    });
  }
};

export const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type = 'all' } = req.query;
    
    let whereClause = 'WHERE user_id = $1';
    let params = [userId];
    let paramCount = 1;

    // Filtro por tipo de actividad
    if (type !== 'all') {
      paramCount++;
      whereClause += ` AND activity_type = $${paramCount}`;
      params.push(type);
    }

    const offset = (page - 1) * limit;

    // Consulta para obtener actividades del usuario
    const activitiesQuery = `
      SELECT 
        id,
        activity_type as type,
        title,
        description,
        course_id as "courseId",
        course_title as course,
        points,
        metadata,
        created_at as timestamp,
        CASE 
          WHEN activity_type = 'lesson_completed' THEN '✅'
          WHEN activity_type = 'quiz_passed' THEN '🎯'
          WHEN activity_type = 'certificate_earned' THEN '🏆'
          WHEN activity_type = 'course_enrolled' THEN '📚'
          WHEN activity_type = 'streak_milestone' THEN '🔥'
          ELSE '📝'
        END as icon
      FROM user_activities
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    // Consulta para contar total de actividades
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_activities
      ${whereClause}
    `;

    const [activitiesResult, countResult] = await Promise.all([
      pool.query(activitiesQuery, params),
      pool.query(countQuery, params.slice(0, paramCount))
    ]);

    // Procesar actividades para incluir metadata adicional
    const activitiesWithMetadata = activitiesResult.rows.map(activity => {
      const result = {
        ...activity,
        timestamp: activity.timestamp.toISOString()
      };

      // Agregar metadata específica según el tipo
      if (activity.metadata) {
        if (activity.type === 'quiz_passed' && activity.metadata.score) {
          result.score = activity.metadata.score;
        }
        if (activity.type === 'certificate_earned' && activity.metadata.certificateId) {
          result.certificateId = activity.metadata.certificateId;
        }
        if (activity.type === 'streak_milestone' && activity.metadata.streak) {
          result.streak = activity.metadata.streak;
        }
      }

      return result;
    });

    const total = parseInt(countResult.rows[0].total);

    res.json({
      items: activitiesWithMetadata,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error getting user activities:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las actividades del usuario'
    });
  }
};