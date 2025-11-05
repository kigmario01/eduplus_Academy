import db from '../config/db.js';

const getInstructorId = (req) => {
  const rawValue = req.user?.id ?? req.query.instructorId ?? 1;
  const parsed = parseInt(rawValue, 10);
  return Number.isNaN(parsed) ? 1 : parsed;
};

// Derivar nombre del usuario desde columnas reales: name y lastname
const USER_NAME_EXPR = "NULLIF(TRIM(CONCAT_WS(' ', u.name, u.lastname)), '')";

export const instructorController = {
  async getDashboard(req, res) {
    try {
      const instructorId = getInstructorId(req);

      const [statsResult, recentCoursesResult, activityResult] = await Promise.all([
        db.query(
          `SELECT
            COUNT(DISTINCT c.id) AS total_courses,
            COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) AS published_courses,
            COUNT(DISTINCT CASE WHEN c.status = 'draft' THEN c.id END) AS draft_courses,
            COUNT(DISTINCT ce.user_id) AS total_students,
            COUNT(CASE WHEN ce.completed_at IS NULL THEN 1 END) AS active_enrollments,
            COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) AS completed_enrollments,
            COALESCE(AVG(cr.rating), 0) AS average_rating,
            COUNT(DISTINCT CASE WHEN ce.enrolled_at >= NOW() - INTERVAL '30 days' THEN ce.user_id END) AS new_students
          FROM courses c
          LEFT JOIN course_enrollments ce ON ce.course_id = c.id
          LEFT JOIN course_reviews cr ON cr.course_id = c.id
          WHERE c.instructor_id = $1`,
          [instructorId]
        ),
        db.query(
          `SELECT
            c.id,
            c.title,
            c.status,
            c.created_at,
            COALESCE(AVG(cr.rating), 0) AS rating,
            COUNT(ce.id) AS enrollment_count
          FROM courses c
          LEFT JOIN course_enrollments ce ON ce.course_id = c.id
          LEFT JOIN course_reviews cr ON cr.course_id = c.id
          WHERE c.instructor_id = $1
          GROUP BY c.id
          ORDER BY c.created_at DESC
          LIMIT 5`,
          [instructorId]
        ),
        db.query(
          `SELECT * FROM (
            SELECT
              ce.enrolled_at AS occurred_at,
              'enrollment' AS type,
              ${USER_NAME_EXPR} AS actor_name,
              c.title AS course_title
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            LEFT JOIN users u ON ce.user_id = u.id
            WHERE c.instructor_id = $1

            UNION ALL

            SELECT
              ce.completed_at AS occurred_at,
              'completion' AS type,
              ${USER_NAME_EXPR} AS actor_name,
              c.title AS course_title
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            LEFT JOIN users u ON ce.user_id = u.id
            WHERE c.instructor_id = $1 AND ce.completed_at IS NOT NULL

            UNION ALL

            SELECT
              cr.created_at AS occurred_at,
              'review' AS type,
              ${USER_NAME_EXPR} AS actor_name,
              c.title AS course_title
            FROM course_reviews cr
            JOIN courses c ON cr.course_id = c.id
            LEFT JOIN users u ON cr.user_id = u.id
            WHERE c.instructor_id = $1
          ) activity
          WHERE occurred_at IS NOT NULL
          ORDER BY occurred_at DESC
          LIMIT 10`,
          [instructorId]
        )
      ]);

      const rawStats = statsResult.rows[0] || {};
      const totalStudents = parseInt(rawStats.total_students, 10) || 0;
      const completedEnrollments = parseInt(rawStats.completed_enrollments, 10) || 0;

      const stats = {
        totalCourses: parseInt(rawStats.total_courses, 10) || 0,
        publishedCourses: parseInt(rawStats.published_courses, 10) || 0,
        draftCourses: parseInt(rawStats.draft_courses, 10) || 0,
        totalStudents,
        activeEnrollments: parseInt(rawStats.active_enrollments, 10) || 0,
        completedEnrollments,
        averageRating: Number.parseFloat(rawStats.average_rating || 0).toFixed(1),
        newStudents: parseInt(rawStats.new_students, 10) || 0,
        completionRate: totalStudents > 0 ? Math.round((completedEnrollments / totalStudents) * 100) : 0
      };

      const recentCourses = recentCoursesResult.rows.map((course) => ({
        id: course.id,
        title: course.title,
        status: course.status,
        createdAt: course.created_at,
        enrollmentCount: parseInt(course.enrollment_count, 10) || 0,
        rating: Number.parseFloat(course.rating || 0).toFixed(1)
      }));

      const recentActivity = activityResult.rows.map((item) => ({
        type: item.type,
        actorName: item.actor_name,
        courseTitle: item.course_title,
        occurredAt: item.occurred_at
      }));

      res.json({
        success: true,
        data: {
          stats,
          recentCourses,
          recentActivity
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

  async getInstructorCourses(req, res) {
    try {
      const instructorId = getInstructorId(req);
      const { status, page = 1, limit = 10 } = req.query;

      let whereClause = 'WHERE c.instructor_id = $1';
      const params = [instructorId];

      if (status && status !== 'all') {
        whereClause += ` AND c.status = $${params.length + 1}`;
        params.push(status);
      }

      const offset = (page - 1) * limit;

      const coursesResult = await db.query(
        `SELECT
          c.id,
          c.title,
          c.status,
          c.created_at,
          c.updated_at,
          c.thumbnail_url,
          c.price,
          c.level,
          c.duration_hours,
          cat.name AS category_name,
          COUNT(ce.id) AS enrollment_count,
          COALESCE(AVG(cr.rating), 0) AS rating
        FROM courses c
        LEFT JOIN course_categories cat ON c.category_id = cat.id
        LEFT JOIN course_enrollments ce ON ce.course_id = c.id
        LEFT JOIN course_reviews cr ON cr.course_id = c.id
        ${whereClause}
        GROUP BY c.id, cat.name
        ORDER BY c.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      const countResult = await db.query(
        `SELECT COUNT(*)
         FROM courses c
         ${whereClause}`,
        params
      );

      res.json({
        success: true,
        data: {
          courses: coursesResult.rows.map((course) => ({
            ...course,
            enrollment_count: parseInt(course.enrollment_count, 10) || 0,
            rating: Number.parseFloat(course.rating || 0).toFixed(1)
          })),
          pagination: {
            page: Number.parseInt(page, 10),
            limit: Number.parseInt(limit, 10),
            total: Number.parseInt(countResult.rows[0].count, 10) || 0,
            totalPages: Math.ceil((Number.parseInt(countResult.rows[0].count, 10) || 0) / limit)
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

  async getAnalytics(req, res) {
    try {
      const instructorId = getInstructorId(req);

      const [generalStats, topCourses, categoryStats, monthlyStats, weeklyProgress, recentActivity] = await Promise.all([
        db.query(
          `SELECT
            COUNT(DISTINCT ce.user_id) AS total_students,
            COUNT(DISTINCT c.id) AS total_courses,
            COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) AS active_courses,
            COALESCE(AVG(cr.rating), 0) AS average_rating,
            COUNT(ce.id) AS total_enrollments,
            COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) AS completed_enrollments
          FROM courses c
          LEFT JOIN course_enrollments ce ON ce.course_id = c.id
          LEFT JOIN course_reviews cr ON cr.course_id = c.id
          WHERE c.instructor_id = $1`,
          [instructorId]
        ),
        db.query(
          `SELECT
            c.id,
            c.title,
            COUNT(DISTINCT ce.user_id) AS students,
            COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) AS completions,
            COALESCE(AVG(cr.rating), 0) AS rating,
            cat.name AS category
          FROM courses c
          LEFT JOIN course_enrollments ce ON ce.course_id = c.id
          LEFT JOIN course_reviews cr ON cr.course_id = c.id
          LEFT JOIN course_categories cat ON c.category_id = cat.id
          WHERE c.instructor_id = $1
          GROUP BY c.id, cat.name
          ORDER BY students DESC
          LIMIT 5`,
          [instructorId]
        ),
        db.query(
          `SELECT
            cat.name AS category,
            COUNT(DISTINCT ce.user_id) AS students,
            COUNT(ce.id) AS enrollments
          FROM courses c
          LEFT JOIN course_enrollments ce ON ce.course_id = c.id
          LEFT JOIN course_categories cat ON c.category_id = cat.id
          WHERE c.instructor_id = $1
          GROUP BY cat.name
          ORDER BY students DESC`,
          [instructorId]
        ),
        db.query(
          `SELECT
            TO_CHAR(DATE_TRUNC('month', ce.enrolled_at), 'Mon') AS month,
            COUNT(DISTINCT ce.user_id) AS students,
            COUNT(ce.id) AS enrollments,
            COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) AS completions
          FROM course_enrollments ce
          JOIN courses c ON ce.course_id = c.id
          WHERE c.instructor_id = $1
            AND ce.enrolled_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
          GROUP BY DATE_TRUNC('month', ce.enrolled_at)
          ORDER BY DATE_TRUNC('month', ce.enrolled_at)`,
          [instructorId]
        ),
        db.query(
          `SELECT
            TO_CHAR(DATE_TRUNC('day', COALESCE(lp.completed_at, lp.updated_at)), 'Dy') AS day,
            COALESCE(SUM(lp.time_spent_minutes), 0) AS minutes,
            COUNT(DISTINCT lp.user_id) AS students
          FROM lesson_progress lp
          JOIN course_lessons cl ON lp.lesson_id = cl.id
          JOIN course_sections cs ON cl.section_id = cs.id
          JOIN courses c ON cs.course_id = c.id
          WHERE c.instructor_id = $1
            AND COALESCE(lp.completed_at, lp.updated_at) >= NOW() - INTERVAL '7 days'
          GROUP BY DATE_TRUNC('day', COALESCE(lp.completed_at, lp.updated_at))
          ORDER BY DATE_TRUNC('day', COALESCE(lp.completed_at, lp.updated_at))`,
          [instructorId]
        ),
        db.query(
          `SELECT
            ce.enrolled_at AS occurred_at,
            'enrollment' AS type,
            ${USER_NAME_EXPR} AS actor_name,
            c.title AS course_title
          FROM course_enrollments ce
          JOIN courses c ON ce.course_id = c.id
          LEFT JOIN users u ON ce.user_id = u.id
          WHERE c.instructor_id = $1
          ORDER BY ce.enrolled_at DESC
          LIMIT 10`,
          [instructorId]
        )
      ]);

      const general = generalStats.rows[0] || {};
      const totalEnrollments = parseInt(general.total_enrollments, 10) || 0;
      const completedEnrollments = parseInt(general.completed_enrollments, 10) || 0;

      res.json({
        success: true,
        data: {
          totalStudents: parseInt(general.total_students, 10) || 0,
          totalCourses: parseInt(general.total_courses, 10) || 0,
          activeCourses: parseInt(general.active_courses, 10) || 0,
          averageRating: Number.parseFloat(general.average_rating || 0).toFixed(1),
          completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
          monthlyStats: monthlyStats.rows,
          weeklyProgress: weeklyProgress.rows.map((entry) => {
            const minutes = Number.parseFloat(entry.minutes ?? 0);
            const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
            return {
              day: entry.day,
              hours: safeMinutes / 60,
              students: parseInt(entry.students, 10) || 0
            };
          }),
          topCourses: topCourses.rows.map((course) => ({
            ...course,
            students: parseInt(course.students, 10) || 0,
            completions: parseInt(course.completions, 10) || 0,
            rating: Number.parseFloat(course.rating || 0).toFixed(1)
          })),
          categoryStats: categoryStats.rows.map((item) => ({
            ...item,
            students: parseInt(item.students, 10) || 0,
            enrollments: parseInt(item.enrollments, 10) || 0
          })),
          recentActivity: recentActivity.rows.map((item) => ({
            type: item.type,
            actorName: item.actor_name,
            courseTitle: item.course_title,
            occurredAt: item.occurred_at
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching instructor analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las analíticas del instructor'
      });
    }
  },

  async getStudents(req, res) {
    try {
      const instructorId = getInstructorId(req);
      const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

      const params = [instructorId];
      let whereClause = 'WHERE c.instructor_id = $1';

      if (search) {
        params.push(`%${search}%`);
        whereClause += ` AND (${USER_NAME_EXPR} ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
      }

      if (status === 'active') {
        whereClause += " AND (ce.completed_at IS NULL AND (ce.last_accessed_at IS NULL OR ce.last_accessed_at >= NOW() - INTERVAL '30 days'))";
      } else if (status === 'inactive') {
        whereClause += " AND (ce.completed_at IS NULL AND ce.last_accessed_at < NOW() - INTERVAL '30 days')";
      } else if (status === 'completed') {
        whereClause += ' AND ce.completed_at IS NOT NULL';
      }

      const offset = (page - 1) * limit;

      const studentsResult = await db.query(
        `SELECT
          u.id,
          ${USER_NAME_EXPR} AS full_name,
          u.email,
          u.avatar_url,
          MIN(ce.enrolled_at) AS first_enrolled_at,
          MAX(ce.last_accessed_at) AS last_accessed_at,
          COUNT(DISTINCT ce.course_id) AS enrolled_courses,
          AVG(ce.progress_percentage) AS average_progress,
          COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) AS completed_courses
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        LEFT JOIN users u ON ce.user_id = u.id
        ${whereClause}
        GROUP BY u.id, u.name, u.lastname, u.email, u.avatar_url
        ORDER BY last_accessed_at DESC NULLS LAST
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      const countResult = await db.query(
        `SELECT COUNT(DISTINCT ce.user_id) AS total
         FROM course_enrollments ce
         JOIN courses c ON ce.course_id = c.id
         LEFT JOIN users u ON ce.user_id = u.id
         ${whereClause}`,
        params
      );

      const students = await Promise.all(
        studentsResult.rows.map(async (student) => {
          const courses = await db.query(
            `SELECT
              c.id,
              c.title,
              ce.progress_percentage,
              ce.completed_at,
              ce.enrolled_at
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.user_id = $1 AND c.instructor_id = $2
            ORDER BY ce.enrolled_at DESC`,
            [student.id, instructorId]
          );

          const timeResult = await db.query(
            `SELECT COALESCE(SUM(lp.time_spent_minutes), 0) AS minutes
             FROM lesson_progress lp
             JOIN course_lessons cl ON lp.lesson_id = cl.id
             JOIN course_sections cs ON cl.section_id = cs.id
             JOIN courses c ON cs.course_id = c.id
             WHERE lp.user_id = $1 AND c.instructor_id = $2`,
            [student.id, instructorId]
          );

          const progress = Number.parseFloat(student.average_progress || 0);
          const derivedStatus = student.completed_courses > 0
            ? 'completed'
            : (student.last_accessed_at && new Date(student.last_accessed_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ? 'active'
              : 'inactive');

          return {
            id: student.id,
            name: student.full_name,
            email: student.email,
            avatarUrl: student.avatar_url,
            enrolledCourses: parseInt(student.enrolled_courses, 10) || 0,
            completedCourses: parseInt(student.completed_courses, 10) || 0,
            totalProgress: Math.round(progress) || 0,
            lastActivity: student.last_accessed_at,
            firstEnrollment: student.first_enrolled_at,
            status: derivedStatus,
            totalHours: Math.round((Number.parseFloat(timeResult.rows[0]?.minutes || 0)) / 60),
            courses: courses.rows.map((course) => ({
              id: course.id,
              title: course.title,
              progress: Math.round(Number.parseFloat(course.progress_percentage || 0)),
              completed: Boolean(course.completed_at)
            }))
          };
        })
      );

      const summaryResult = await db.query(
        `SELECT
          COUNT(DISTINCT ce.user_id) AS total_students,
          COUNT(DISTINCT CASE WHEN ce.completed_at IS NOT NULL THEN ce.user_id END) AS completed_students,
          COUNT(DISTINCT CASE WHEN ce.completed_at IS NULL AND (ce.last_accessed_at IS NULL OR ce.last_accessed_at >= NOW() - INTERVAL '30 days') THEN ce.user_id END) AS active_students,
          COUNT(DISTINCT CASE WHEN ce.completed_at IS NULL AND ce.last_accessed_at < NOW() - INTERVAL '30 days' THEN ce.user_id END) AS inactive_students
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE c.instructor_id = $1`,
        [instructorId]
      );

      const summary = summaryResult.rows[0] || {};

      res.json({
        success: true,
        data: {
          students,
          pagination: {
            total: Number.parseInt(countResult.rows[0].total, 10) || 0,
            page: Number.parseInt(page, 10),
            limit: Number.parseInt(limit, 10),
            totalPages: Math.ceil((Number.parseInt(countResult.rows[0].total, 10) || 0) / limit)
          },
          summary: {
            totalStudents: Number.parseInt(summary.total_students, 10) || 0,
            activeStudents: Number.parseInt(summary.active_students, 10) || 0,
            inactiveStudents: Number.parseInt(summary.inactive_students, 10) || 0,
            completedStudents: Number.parseInt(summary.completed_students, 10) || 0
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
