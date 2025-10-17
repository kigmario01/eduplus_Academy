import Joi from 'joi';
import db from '../config/db.js';

// Esquemas de validación
const enrollmentSchema = Joi.object({
  course_id: Joi.number().integer().required(),
  payment_method: Joi.string().valid('free', 'credit_card', 'paypal', 'bank_transfer').default('free'),
  payment_amount: Joi.number().min(0).default(0)
});

const progressSchema = Joi.object({
  lesson_id: Joi.number().integer().required(),
  completed: Joi.boolean().default(false),
  time_spent_minutes: Joi.number().integer().min(0).default(0),
  notes: Joi.string().max(1000).optional()
});

export const enrollmentController = {
  // Inscribir a un estudiante en un curso
  async enrollStudent(req, res) {
    try {
      const { error, value } = enrollmentSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de inscripción inválidos',
          errors: error.details
        });
      }

      const { course_id, payment_method, payment_amount } = value;
      const user_id = req.user?.id || 1; // TODO: Obtener del token de autenticación

      // Verificar que el curso existe y está activo
      const courseCheck = await db.query(
        'SELECT id, title, price, status FROM courses WHERE id = $1 AND status = $2',
        [course_id, 'published']
      );

      if (courseCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado o no disponible'
        });
      }

      const course = courseCheck.rows[0];

      // Verificar si el estudiante ya está inscrito
      const existingEnrollment = await db.query(
        'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
        [user_id, course_id]
      );

      if (existingEnrollment.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya estás inscrito en este curso'
        });
      }

      // Verificar el precio del curso
      if (course.price > 0 && payment_amount < course.price) {
        return res.status(400).json({
          success: false,
          message: 'El monto del pago es insuficiente'
        });
      }

      // Crear la inscripción
      const insertQuery = `
        INSERT INTO course_enrollments (
          user_id, course_id, enrollment_date, payment_method, 
          payment_amount, status, progress_percentage
        )
        VALUES ($1, $2, NOW(), $3, $4, 'active', 0)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        user_id,
        course_id,
        payment_method,
        payment_amount
      ]);

      // Actualizar el contador de estudiantes del curso
      await db.query(
        'UPDATE courses SET total_students = total_students + 1 WHERE id = $1',
        [course_id]
      );

      res.status(201).json({
        success: true,
        message: 'Inscripción realizada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error enrolling student:', error);
      res.status(500).json({
        success: false,
        message: 'Error al realizar la inscripción'
      });
    }
  },

  // Obtener cursos inscritos de un estudiante
  async getStudentEnrollments(req, res) {
    try {
      const user_id = req.user?.id || req.params.userId || 1;
      const { status, page = 1, limit = 10 } = req.query;

      let whereClause = 'WHERE ce.user_id = $1';
      const queryParams = [user_id];

      if (status) {
        whereClause += ' AND ce.status = $2';
        queryParams.push(status);
      }

      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          ce.*,
          c.title,
          c.description,
          c.thumbnail_url,
          c.price,
          c.duration_hours,
          c.total_lessons,
          cc.name as category_name,
          u.first_name as instructor_first_name,
          u.last_name as instructor_last_name,
          u.profile_image as instructor_image
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        JOIN course_categories cc ON c.category_id = cc.id
        JOIN users u ON c.instructor_id = u.id
        ${whereClause}
        ORDER BY ce.enrollment_date DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      queryParams.push(limit, offset);

      const result = await db.query(query, queryParams);

      // Contar total de inscripciones
      const countQuery = `
        SELECT COUNT(*) as total
        FROM course_enrollments ce
        ${whereClause}
      `;

      const countResult = await db.query(countQuery, queryParams.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las inscripciones'
      });
    }
  },

  // Obtener progreso de un estudiante en un curso específico
  async getCourseProgress(req, res) {
    try {
      const { courseId } = req.params;
      const user_id = req.user?.id || 1;

      // Verificar que el estudiante está inscrito en el curso
      const enrollmentCheck = await db.query(
        'SELECT id, progress_percentage FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
        [user_id, courseId]
      );

      if (enrollmentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No estás inscrito en este curso'
        });
      }

      // Obtener progreso detallado por secciones y lecciones
      const progressQuery = `
        SELECT 
          cs.id as section_id,
          cs.title as section_title,
          cs.order_index as section_order,
          cl.id as lesson_id,
          cl.title as lesson_title,
          cl.order_index as lesson_order,
          cl.duration_minutes,
          cl.content_type,
          cl.is_mandatory,
          lp.completed,
          lp.completion_date,
          lp.time_spent_minutes,
          lp.notes
        FROM course_sections cs
        LEFT JOIN course_lessons cl ON cs.id = cl.section_id
        LEFT JOIN lesson_progress lp ON cl.id = lp.lesson_id AND lp.user_id = $1
        WHERE cs.course_id = $2
        ORDER BY cs.order_index, cl.order_index
      `;

      const progressResult = await db.query(progressQuery, [user_id, courseId]);

      // Organizar datos por secciones
      const sections = {};
      let totalLessons = 0;
      let completedLessons = 0;

      progressResult.rows.forEach(row => {
        if (!sections[row.section_id]) {
          sections[row.section_id] = {
            id: row.section_id,
            title: row.section_title,
            order_index: row.section_order,
            lessons: []
          };
        }

        if (row.lesson_id) {
          totalLessons++;
          if (row.completed) completedLessons++;

          sections[row.section_id].lessons.push({
            id: row.lesson_id,
            title: row.lesson_title,
            order_index: row.lesson_order,
            duration_minutes: row.duration_minutes,
            content_type: row.content_type,
            is_mandatory: row.is_mandatory,
            completed: row.completed || false,
            completion_date: row.completion_date,
            time_spent_minutes: row.time_spent_minutes || 0,
            notes: row.notes
          });
        }
      });

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      res.json({
        success: true,
        data: {
          course_id: parseInt(courseId),
          enrollment: enrollmentCheck.rows[0],
          progress_percentage: progressPercentage,
          total_lessons: totalLessons,
          completed_lessons: completedLessons,
          sections: Object.values(sections)
        }
      });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el progreso del curso'
      });
    }
  },

  // Marcar una lección como completada o actualizar progreso
  async updateLessonProgress(req, res) {
    try {
      const { lessonId } = req.params;
      const { error, value } = progressSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de progreso inválidos',
          errors: error.details
        });
      }

      const user_id = req.user?.id || 1;
      const { completed, time_spent_minutes, notes } = value;

      // Verificar que la lección existe y obtener el course_id
      const lessonCheck = await db.query(
        'SELECT id, course_id FROM course_lessons WHERE id = $1',
        [lessonId]
      );

      if (lessonCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
      }

      const courseId = lessonCheck.rows[0].course_id;

      // Verificar que el estudiante está inscrito en el curso
      const enrollmentCheck = await db.query(
        'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
        [user_id, courseId]
      );

      if (enrollmentCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No estás inscrito en este curso'
        });
      }

      // Insertar o actualizar el progreso de la lección
      const upsertQuery = `
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completion_date, time_spent_minutes, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
          completed = EXCLUDED.completed,
          completion_date = CASE 
            WHEN EXCLUDED.completed = true AND lesson_progress.completed = false 
            THEN NOW() 
            ELSE lesson_progress.completion_date 
          END,
          time_spent_minutes = EXCLUDED.time_spent_minutes,
          notes = EXCLUDED.notes,
          updated_at = NOW()
        RETURNING *
      `;

      const completionDate = completed ? new Date() : null;
      const result = await db.query(upsertQuery, [
        user_id,
        lessonId,
        completed,
        completionDate,
        time_spent_minutes,
        notes
      ]);

      // Actualizar el porcentaje de progreso del curso
      await this.updateCourseProgress(user_id, courseId);

      res.json({
        success: true,
        message: 'Progreso actualizado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el progreso'
      });
    }
  },

  // Función auxiliar para actualizar el progreso general del curso
  async updateCourseProgress(userId, courseId) {
    try {
      // Calcular el porcentaje de progreso
      const progressQuery = `
        SELECT 
          COUNT(*) as total_lessons,
          COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons
        FROM course_lessons cl
        LEFT JOIN lesson_progress lp ON cl.id = lp.lesson_id AND lp.user_id = $1
        WHERE cl.course_id = $2
      `;

      const progressResult = await db.query(progressQuery, [userId, courseId]);
      const { total_lessons, completed_lessons } = progressResult.rows[0];
      
      const progressPercentage = total_lessons > 0 ? Math.round((completed_lessons / total_lessons) * 100) : 0;

      // Actualizar el progreso en la tabla de inscripciones
      await db.query(
        `UPDATE course_enrollments 
         SET progress_percentage = $1, updated_at = NOW()
         WHERE user_id = $2 AND course_id = $3`,
        [progressPercentage, userId, courseId]
      );

      // Si el curso está completado (100%), marcar como completado
      if (progressPercentage === 100) {
        await db.query(
          `UPDATE course_enrollments 
           SET status = 'completed', completion_date = NOW()
           WHERE user_id = $1 AND course_id = $2 AND status = 'active'`,
          [userId, courseId]
        );
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  },

  // Obtener estadísticas de inscripciones para un instructor
  async getInstructorEnrollmentStats(req, res) {
    try {
      const instructor_id = req.user?.id || req.params.instructorId || 1;

      const statsQuery = `
        SELECT 
          c.id,
          c.title,
          COUNT(ce.id) as total_enrollments,
          COUNT(CASE WHEN ce.status = 'active' THEN 1 END) as active_enrollments,
          COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) as completed_enrollments,
          AVG(ce.progress_percentage) as avg_progress,
          SUM(ce.payment_amount) as total_revenue
        FROM courses c
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        WHERE c.instructor_id = $1
        GROUP BY c.id, c.title
        ORDER BY total_enrollments DESC
      `;

      const result = await db.query(statsQuery, [instructor_id]);

      res.json({
        success: true,
        data: result.rows.map(row => ({
          ...row,
          avg_progress: parseFloat(row.avg_progress) || 0,
          total_revenue: parseFloat(row.total_revenue) || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching instructor enrollment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas de inscripciones'
      });
    }
  }
};