import { db } from '../config/db.js';

export const instructorController = {
  // Dashboard del instructor
  async getDashboard(req, res) {
    try {
      // Obtener ID del instructor desde el token de autenticación o query parameter
      const instructorId = req.user?.id || req.query.instructorId || 1;
      
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published_courses,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_courses,
          COALESCE(SUM(price), 0) as total_revenue
        FROM courses 
        WHERE instructor_id = $1
      `, [instructorId]);
      
      const recentCourses = await db.query(`
        SELECT id, title, status, created_at, price
        FROM courses 
        WHERE instructor_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `, [instructorId]);
      
      res.json({
        success: true,
        data: {
          stats: stats.rows[0],
          recentCourses: recentCourses.rows
        }
      });
    } catch (error) {
      console.error('Error fetching instructor dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el dashboard del instructor'
      });
    }
  },

  // Cursos del instructor
  async getInstructorCourses(req, res) {
    try {
      const instructorId = req.user?.id || req.query.instructorId || 1;
      const { status, page = 1, limit = 10 } = req.query;
      
      let whereClause = 'WHERE instructor_id = $1';
      const params = [instructorId];
      
      if (status && status !== 'all') {
        whereClause += ' AND status = $2';
        params.push(status);
      }
      
      const offset = (page - 1) * limit;
      
      const result = await db.query(`
        SELECT 
          c.*,
          cat.name as category_name,
          (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.id) as enrollment_count
        FROM courses c
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]);
      
      const countResult = await db.query(`
        SELECT COUNT(*) FROM courses ${whereClause}
      `, params);
      
      res.json({
        success: true,
        data: {
          courses: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(countResult.rows[0].count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los cursos del instructor'
      });
    }
  },

  // Analytics del instructor
  async getAnalytics(req, res) {
    try {
      const instructorId = req.user?.id || req.query.instructorId || 1;
      
      // Estadísticas generales
      const generalStats = await db.query(`
        SELECT 
          COUNT(DISTINCT ce.user_id) as total_students,
          COALESCE(SUM(c.price), 0) as total_revenue,
          COALESCE(AVG(cr.rating), 0) as average_rating,
          COUNT(DISTINCT c.id) as total_courses,
          COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) as active_courses
        FROM courses c
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.instructor_id = $1
      `, [instructorId]);

      // Top cursos por estudiantes
      const topCourses = await db.query(`
        SELECT 
          c.id,
          c.title,
          COUNT(DISTINCT ce.user_id) as students,
          COALESCE(SUM(c.price), 0) as revenue,
          COALESCE(AVG(cr.rating), 0) as rating,
          cat.name as category,
          ROUND(
            (COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) * 100.0) / 
            NULLIF(COUNT(ce.id), 0), 2
          ) as completion_rate
        FROM courses c
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        WHERE c.instructor_id = $1
        GROUP BY c.id, c.title, c.price, cat.name
        ORDER BY students DESC
        LIMIT 5
      `, [instructorId]);

      // Estadísticas por categoría
      const categoryStats = await db.query(`
        SELECT 
          cat.name as category,
          COUNT(DISTINCT ce.user_id) as students,
          COALESCE(SUM(c.price), 0) as revenue
        FROM courses c
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        WHERE c.instructor_id = $1
        GROUP BY cat.name
        ORDER BY students DESC
      `, [instructorId]);

      // Actividad reciente (simulada con datos existentes)
      const recentActivity = await db.query(`
        SELECT 
          'enrollment' as type,
          u.name as student,
          c.title as course,
          ce.enrolled_at as timestamp
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        JOIN users u ON ce.user_id = u.id
        WHERE c.instructor_id = $1
        ORDER BY ce.enrolled_at DESC
        LIMIT 10
      `, [instructorId]);

      // Estadísticas mensuales reales de los últimos 6 meses
      const monthlyStats = await db.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', ce.enrolled_at), 'Month') as month,
          COUNT(DISTINCT ce.user_id) as students,
          COALESCE(SUM(c.price), 0) as revenue,
          COUNT(ce.id) as enrollments,
          COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) as completions
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE c.instructor_id = $1 
          AND ce.enrolled_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', ce.enrolled_at)
        ORDER BY DATE_TRUNC('month', ce.enrolled_at)
      `, [instructorId]);

      // Progreso semanal real de la última semana
      const weeklyProgress = await db.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('day', ua.created_at), 'Dy') as day,
          COALESCE(SUM(ua.time_spent), 0) / 60 as hours,
          COUNT(DISTINCT ua.user_id) as students
        FROM user_activities ua
        JOIN course_enrollments ce ON ua.user_id = ce.user_id
        JOIN courses c ON ce.course_id = c.id
        WHERE c.instructor_id = $1 
          AND ua.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', ua.created_at)
        ORDER BY DATE_TRUNC('day', ua.created_at)
      `, [instructorId]);

      // Calcular tasa de completación real
      const completionRateQuery = await db.query(`
        SELECT 
          ROUND(
            (COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) * 100.0) / 
            NULLIF(COUNT(*), 0), 2
          ) as completion_rate
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE c.instructor_id = $1
      `, [instructorId]);

      const analytics = {
        ...generalStats.rows[0],
        averageRating: parseFloat(generalStats.rows[0].average_rating || 0).toFixed(1),
        completionRate: parseFloat(completionRateQuery.rows[0]?.completion_rate || 0),
        monthlyStats: monthlyStats.rows,
        topCourses: topCourses.rows.map(course => ({
          ...course,
          rating: parseFloat(course.rating || 0).toFixed(1),
          completionRate: parseFloat(course.completion_rate || 0)
        })),
        recentActivity: recentActivity.rows,
        categoryStats: categoryStats.rows,
        weeklyProgress: weeklyProgress.rows
      };
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching instructor analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las analíticas del instructor'
      });
    }
  },

  // Estudiantes del instructor
  async getStudents(req, res) {
    try {
      const instructorId = req.user?.id || req.query.instructorId || 1;
      const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
      
      let whereClause = `WHERE c.instructor_id = $1`;
      let params = [instructorId];
      let paramCount = 1;

      // Filtro de búsqueda
      if (search) {
        paramCount++;
        whereClause += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      // Filtro de estado (simulado basado en actividad reciente)
      let statusFilter = '';
      if (status !== 'all') {
        if (status === 'active') {
          statusFilter = ` AND ce.enrolled_at >= NOW() - INTERVAL '30 days'`;
        } else if (status === 'inactive') {
          statusFilter = ` AND ce.enrolled_at < NOW() - INTERVAL '30 days'`;
        }
      }

      const offset = (page - 1) * limit;

      // Consulta principal para obtener estudiantes
      const studentsQuery = `
        SELECT DISTINCT
          u.id,
          u.name,
          u.email,
          u.avatar,
          u.created_at as join_date,
          COUNT(DISTINCT ce.course_id) as enrolled_courses,
          MAX(ce.enrolled_at) as last_activity,
          CASE 
            WHEN MAX(ce.enrolled_at) >= NOW() - INTERVAL '30 days' THEN 'active'
            ELSE 'inactive'
          END as status
        FROM users u
        JOIN course_enrollments ce ON u.id = ce.user_id
        JOIN courses c ON ce.course_id = c.id
        ${whereClause}${statusFilter}
        GROUP BY u.id, u.name, u.email, u.avatar, u.created_at
        ORDER BY last_activity DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const students = await db.query(studentsQuery, [...params, limit, offset]);

      // Consulta para contar total de estudiantes
      const countQuery = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM users u
        JOIN course_enrollments ce ON u.id = ce.user_id
        JOIN courses c ON ce.course_id = c.id
        ${whereClause}${statusFilter}
      `;

      const countResult = await db.query(countQuery, params);

      // Obtener cursos actuales para cada estudiante
      const studentsWithCourses = await Promise.all(
        students.rows.map(async (student) => {
          const coursesQuery = `
            SELECT 
              c.id,
              c.title,
              COALESCE(lp.progress_percentage, 0) as progress
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            LEFT JOIN (
              SELECT 
                course_id, 
                user_id, 
                AVG(progress_percentage) as progress_percentage
              FROM lesson_progress 
              GROUP BY course_id, user_id
            ) lp ON c.id = lp.course_id AND ce.user_id = lp.user_id
            WHERE ce.user_id = $1 AND c.instructor_id = $2
            ORDER BY ce.enrolled_at DESC
          `;

          const courses = await db.query(coursesQuery, [student.id, instructorId]);
          
          // Obtener horas totales reales del estudiante
          const hoursQuery = await db.query(`
            SELECT COALESCE(SUM(ua.time_spent), 0) / 60 as total_hours
            FROM user_activities ua
            JOIN course_enrollments ce ON ua.user_id = ce.user_id
            JOIN courses c ON ce.course_id = c.id
            WHERE ua.user_id = $1 AND c.instructor_id = $2
          `, [student.id, instructorId]);
          
          return {
            ...student,
            currentCourses: courses.rows,
            completedCourses: courses.rows.filter(c => c.progress >= 100).length,
            totalProgress: courses.rows.length > 0 
              ? Math.round(courses.rows.reduce((sum, c) => sum + c.progress, 0) / courses.rows.length)
              : 0,
            totalHours: Math.round(parseFloat(hoursQuery.rows[0]?.total_hours || 0)),
            certificates: courses.rows.filter(c => c.progress >= 100).length
          };
        })
      );

      // Resumen de estadísticas
      const summaryQuery = `
        SELECT 
          COUNT(DISTINCT u.id) as total_students,
          COUNT(DISTINCT CASE WHEN ce.enrolled_at >= NOW() - INTERVAL '30 days' THEN u.id END) as active_students,
          COUNT(DISTINCT CASE WHEN ce.enrolled_at < NOW() - INTERVAL '30 days' THEN u.id END) as inactive_students
        FROM users u
        JOIN course_enrollments ce ON u.id = ce.user_id
        JOIN courses c ON ce.course_id = c.id
        WHERE c.instructor_id = $1
      `;

      const summary = await db.query(summaryQuery, [instructorId]);

      res.json({
        success: true,
        data: {
          students: studentsWithCourses,
          pagination: {
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult.rows[0].total / limit)
          },
          summary: {
            totalStudents: parseInt(summary.rows[0].total_students),
            activeStudents: parseInt(summary.rows[0].active_students),
            inactiveStudents: parseInt(summary.rows[0].inactive_students),
            completedStudents: 0 // Se puede calcular con datos reales más adelante
          }
        }
      });
    } catch (error) {
      console.error('Error fetching instructor students:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los estudiantes del instructor'
      });
    }
  }
};