import Joi from 'joi';
import { db } from '../config/db.js';

// Esquemas de validación
const sectionSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  order_index: Joi.number().integer().min(0).required()
});

const lessonSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  content_type: Joi.string().valid('video', 'text', 'quiz', 'assignment', 'download').required(),
  content_url: Joi.string().uri().optional(),
  content_text: Joi.string().optional(),
  duration_minutes: Joi.number().integer().min(0).default(0),
  order_index: Joi.number().integer().min(0).required(),
  is_preview: Joi.boolean().default(false),
  is_mandatory: Joi.boolean().default(true)
});

export const courseSectionController = {
  // Crear una nueva sección
  async createSection(req, res) {
    try {
      const { courseId } = req.params;
      const { error, value } = sectionSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de sección inválidos',
          errors: error.details
        });
      }

      // Verificar que el curso existe y pertenece al instructor
      const courseCheck = await db.query(
        'SELECT id, instructor_id FROM courses WHERE id = $1',
        [courseId]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      // TODO: Verificar que el usuario autenticado es el instructor del curso
      // if (courseCheck.rows[0].instructor_id !== req.user.id) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'No tienes permisos para modificar este curso'
      //   });
      // }

      const { title, description, order_index } = value;

      const insertQuery = `
        INSERT INTO course_sections (course_id, title, description, order_index, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `;

      const result = await db.query(insertQuery, [courseId, title, description, order_index]);

      res.status(201).json({
        success: true,
        message: 'Sección creada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating section:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la sección'
      });
    }
  },

  // Obtener secciones de un curso
  async getCourseSections(req, res) {
    try {
      const { courseId } = req.params;

      const query = `
        SELECT 
          cs.*,
          COUNT(cl.id) as lesson_count,
          COALESCE(SUM(cl.duration_minutes), 0) as total_duration
        FROM course_sections cs
        LEFT JOIN course_lessons cl ON cs.id = cl.section_id
        WHERE cs.course_id = $1
        GROUP BY cs.id
        ORDER BY cs.order_index ASC
      `;

      const result = await db.query(query, [courseId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching course sections:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las secciones del curso'
      });
    }
  },

  // Actualizar una sección
  async updateSection(req, res) {
    try {
      const { sectionId } = req.params;
      const { error, value } = sectionSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de sección inválidos',
          errors: error.details
        });
      }

      // Verificar que la sección existe
      const sectionCheck = await db.query(
        `SELECT cs.id, c.instructor_id 
         FROM course_sections cs 
         JOIN courses c ON cs.course_id = c.id 
         WHERE cs.id = $1`,
        [sectionId]
      );

      if (sectionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
      }

      const { title, description, order_index } = value;

      const updateQuery = `
        UPDATE course_sections 
        SET title = $1, description = $2, order_index = $3
        WHERE id = $4
        RETURNING *
      `;

      const result = await db.query(updateQuery, [title, description, order_index, sectionId]);

      res.json({
        success: true,
        message: 'Sección actualizada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating section:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la sección'
      });
    }
  },

  // Eliminar una sección
  async deleteSection(req, res) {
    try {
      const { sectionId } = req.params;

      // Verificar que la sección existe
      const sectionCheck = await db.query(
        `SELECT cs.id, c.instructor_id 
         FROM course_sections cs 
         JOIN courses c ON cs.course_id = c.id 
         WHERE cs.id = $1`,
        [sectionId]
      );

      if (sectionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
      }

      // Eliminar la sección (las lecciones se eliminan en cascada)
      await db.query('DELETE FROM course_sections WHERE id = $1', [sectionId]);

      res.json({
        success: true,
        message: 'Sección eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting section:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la sección'
      });
    }
  },

  // Crear una nueva lección
  async createLesson(req, res) {
    try {
      const { sectionId } = req.params;
      const { error, value } = lessonSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de lección inválidos',
          errors: error.details
        });
      }

      // Verificar que la sección existe y obtener el course_id
      const sectionCheck = await db.query(
        `SELECT cs.id, cs.course_id, c.instructor_id 
         FROM course_sections cs 
         JOIN courses c ON cs.course_id = c.id 
         WHERE cs.id = $1`,
        [sectionId]
      );

      if (sectionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
      }

      const courseId = sectionCheck.rows[0].course_id;
      const {
        title,
        description,
        content_type,
        content_url,
        content_text,
        duration_minutes,
        order_index,
        is_preview,
        is_mandatory
      } = value;

      const insertQuery = `
        INSERT INTO course_lessons (
          section_id, course_id, title, description, content_type, 
          content_url, content_text, duration_minutes, order_index, 
          is_preview, is_mandatory, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        sectionId,
        courseId,
        title,
        description,
        content_type,
        content_url,
        content_text,
        duration_minutes,
        order_index,
        is_preview,
        is_mandatory
      ]);

      // Actualizar el total de lecciones y duración del curso
      await this.updateCourseStats(courseId);

      res.status(201).json({
        success: true,
        message: 'Lección creada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la lección'
      });
    }
  },

  // Obtener lecciones de una sección
  async getSectionLessons(req, res) {
    try {
      const { sectionId } = req.params;

      const query = `
        SELECT *
        FROM course_lessons
        WHERE section_id = $1
        ORDER BY order_index ASC
      `;

      const result = await db.query(query, [sectionId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching section lessons:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las lecciones de la sección'
      });
    }
  },

  // Actualizar una lección
  async updateLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const { error, value } = lessonSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de lección inválidos',
          errors: error.details
        });
      }

      // Verificar que la lección existe
      const lessonCheck = await db.query(
        `SELECT cl.id, cl.course_id, c.instructor_id 
         FROM course_lessons cl 
         JOIN courses c ON cl.course_id = c.id 
         WHERE cl.id = $1`,
        [lessonId]
      );

      if (lessonCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
      }

      const courseId = lessonCheck.rows[0].course_id;
      const {
        title,
        description,
        content_type,
        content_url,
        content_text,
        duration_minutes,
        order_index,
        is_preview,
        is_mandatory
      } = value;

      const updateQuery = `
        UPDATE course_lessons 
        SET title = $1, description = $2, content_type = $3, content_url = $4,
            content_text = $5, duration_minutes = $6, order_index = $7,
            is_preview = $8, is_mandatory = $9
        WHERE id = $10
        RETURNING *
      `;

      const result = await db.query(updateQuery, [
        title,
        description,
        content_type,
        content_url,
        content_text,
        duration_minutes,
        order_index,
        is_preview,
        is_mandatory,
        lessonId
      ]);

      // Actualizar estadísticas del curso
      await this.updateCourseStats(courseId);

      res.json({
        success: true,
        message: 'Lección actualizada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la lección'
      });
    }
  },

  // Eliminar una lección
  async deleteLesson(req, res) {
    try {
      const { lessonId } = req.params;

      // Verificar que la lección existe y obtener course_id
      const lessonCheck = await db.query(
        `SELECT cl.id, cl.course_id, c.instructor_id 
         FROM course_lessons cl 
         JOIN courses c ON cl.course_id = c.id 
         WHERE cl.id = $1`,
        [lessonId]
      );

      if (lessonCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lección no encontrada'
        });
      }

      const courseId = lessonCheck.rows[0].course_id;

      // Eliminar la lección
      await db.query('DELETE FROM course_lessons WHERE id = $1', [lessonId]);

      // Actualizar estadísticas del curso
      await this.updateCourseStats(courseId);

      res.json({
        success: true,
        message: 'Lección eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la lección'
      });
    }
  },

  // Función auxiliar para actualizar estadísticas del curso
  async updateCourseStats(courseId) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_lessons,
          COALESCE(SUM(duration_minutes), 0) as total_duration_minutes
        FROM course_lessons
        WHERE course_id = $1
      `;

      const statsResult = await db.query(statsQuery, [courseId]);
      const { total_lessons, total_duration_minutes } = statsResult.rows[0];
      const duration_hours = Math.ceil(total_duration_minutes / 60);

      await db.query(
        `UPDATE courses 
         SET total_lessons = $1, duration_hours = $2, updated_at = NOW()
         WHERE id = $3`,
        [total_lessons, duration_hours, courseId]
      );
    } catch (error) {
      console.error('Error updating course stats:', error);
    }
  }
};