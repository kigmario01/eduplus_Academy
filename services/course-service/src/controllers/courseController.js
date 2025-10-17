import slugify from 'slugify';
import Joi from 'joi';
import { db } from '../config/db.js';

// Esquema de validación para cursos
const courseSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).required(),
  short_description: Joi.string().max(500).optional(),
  category_id: Joi.number().integer().positive().required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default('USD'),
  thumbnail_url: Joi.string().uri().optional(),
  preview_video_url: Joi.string().uri().optional(),
  duration_hours: Joi.number().integer().min(0).optional(),
  language: Joi.string().length(2).default('es'),
  requirements: Joi.array().items(Joi.string()).optional(),
  what_you_learn: Joi.array().items(Joi.string()).optional(),
  target_audience: Joi.array().items(Joi.string()).optional()
});

export const courseController = {
  // Obtener todos los cursos con filtros y paginación
  async getAllCourses(req, res) {
    try {
      const { 
        category, 
        level, 
        status = 'published', 
        featured, 
        search, 
        page = 1, 
        limit = 12,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      // Construir la consulta SQL base
      let query = `
        SELECT 
          c.*,
          cc.name as category_name,
          u.first_name || ' ' || u.last_name as instructor_name,
          COUNT(DISTINCT ce.user_id) as total_students,
          COUNT(DISTINCT cr.id) as total_reviews,
          COALESCE(AVG(cr.rating), 0) as rating
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE 1=1
      `;

      const queryParams = [];
      let paramIndex = 1;

      // Aplicar filtros
      if (category) {
        query += ` AND c.category_id = $${paramIndex}`;
        queryParams.push(parseInt(category));
        paramIndex++;
      }

      if (level) {
        query += ` AND c.level = $${paramIndex}`;
        queryParams.push(level);
        paramIndex++;
      }

      if (status !== 'all') {
        query += ` AND c.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      if (featured === 'true') {
        query += ` AND c.featured = true`;
      }

      if (search) {
        query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Agrupar por curso
      query += ` GROUP BY c.id, cc.name, u.first_name, u.last_name`;

      // Ordenar
      const validSortFields = ['created_at', 'title', 'price', 'rating', 'total_students'];
      const sortField = validSortFields.includes(sort) ? sort : 'created_at';
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      
      if (sortField === 'rating') {
        query += ` ORDER BY COALESCE(AVG(cr.rating), 0) ${sortOrder}`;
      } else if (sortField === 'total_students') {
        query += ` ORDER BY COUNT(DISTINCT ce.user_id) ${sortOrder}`;
      } else {
        query += ` ORDER BY c.${sortField} ${sortOrder}`;
      }

      // Paginación
      const offset = (page - 1) * limit;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      // Ejecutar consulta principal
      const result = await db.query(query, queryParams);

      // Consulta para contar el total de cursos (sin paginación)
      let countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE 1=1
      `;

      const countParams = [];
      let countParamIndex = 1;

      // Aplicar los mismos filtros para el conteo
      if (category) {
        countQuery += ` AND c.category_id = $${countParamIndex}`;
        countParams.push(parseInt(category));
        countParamIndex++;
      }

      if (level) {
        countQuery += ` AND c.level = $${countParamIndex}`;
        countParams.push(level);
        countParamIndex++;
      }

      if (status !== 'all') {
        countQuery += ` AND c.status = $${countParamIndex}`;
        countParams.push(status);
        countParamIndex++;
      }

      if (featured === 'true') {
        countQuery += ` AND c.featured = true`;
      }

      if (search) {
        countQuery += ` AND (c.title ILIKE $${countParamIndex} OR c.description ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: {
          courses: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los cursos'
      });
    }
  },

  // Obtener curso por ID o slug
  async getCourseByIdOrSlug(req, res) {
    try {
      const { id } = req.params;
      
      // Consulta para obtener el curso con información relacionada
      const courseQuery = `
        SELECT 
          c.*,
          cc.name as category_name,
          u.first_name || ' ' || u.last_name as instructor_name,
          u.instructor_bio,
          u.instructor_rating,
          COUNT(DISTINCT ce.user_id) as total_students,
          COUNT(DISTINCT cr.id) as total_reviews,
          COALESCE(AVG(cr.rating), 0) as rating
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.id = $1 OR c.slug = $1
        GROUP BY c.id, cc.name, u.first_name, u.last_name, u.instructor_bio, u.instructor_rating
      `;

      const courseResult = await db.query(courseQuery, [id]);

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      const course = courseResult.rows[0];

      // Obtener secciones y lecciones del curso
      const sectionsQuery = `
        SELECT 
          cs.*,
          json_agg(
            json_build_object(
              'id', cl.id,
              'title', cl.title,
              'description', cl.description,
              'content_type', cl.content_type,
              'duration_minutes', cl.duration_minutes,
              'order_index', cl.order_index,
              'is_preview', cl.is_preview
            ) ORDER BY cl.order_index
          ) as lessons
        FROM course_sections cs
        LEFT JOIN course_lessons cl ON cs.id = cl.section_id
        WHERE cs.course_id = $1
        GROUP BY cs.id
        ORDER BY cs.order_index
      `;

      const sectionsResult = await db.query(sectionsQuery, [course.id]);

      res.json({
        success: true,
        data: {
          ...course,
          sections: sectionsResult.rows
        }
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el curso'
      });
    }
  },

  // Crear nuevo curso
  async createCourse(req, res) {
    try {
      const { error, value } = courseSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { title } = value;
      
      // Generar slug único
      let slug = slugify(title, { lower: true, strict: true });
      
      // Verificar si el slug ya existe
      const slugCheckQuery = 'SELECT id FROM courses WHERE slug = $1';
      const slugResult = await db.query(slugCheckQuery, [slug]);
      
      if (slugResult.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }

      // Insertar el nuevo curso
      const insertQuery = `
        INSERT INTO courses (
          title, slug, description, short_description, category_id, level, 
          price, currency, thumbnail_url, preview_video_url, duration_hours, 
          language, requirements, what_you_learn, target_audience, instructor_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *
      `;

      const insertValues = [
        value.title,
        slug,
        value.description,
        value.short_description || null,
        value.category_id,
        value.level,
        value.price,
        value.currency || 'USD',
        value.thumbnail_url || null,
        value.preview_video_url || null,
        value.duration_hours || 0,
        value.language || 'es',
        value.requirements || [],
        value.what_you_learn || [],
        value.target_audience || [],
        1 // TODO: Obtener instructor_id del token de autenticación
      ];

      const result = await db.query(insertQuery, insertValues);
      const newCourse = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Curso creado exitosamente',
        data: newCourse
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el curso'
      });
    }
  },

  // Actualizar curso
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = courseSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Verificar que el curso existe
      const checkQuery = 'SELECT id FROM courses WHERE id = $1';
      const checkResult = await db.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      // Actualizar el curso
      const updateQuery = `
        UPDATE courses SET
          title = $1,
          description = $2,
          short_description = $3,
          category_id = $4,
          level = $5,
          price = $6,
          currency = $7,
          thumbnail_url = $8,
          preview_video_url = $9,
          duration_hours = $10,
          language = $11,
          requirements = $12,
          what_you_learn = $13,
          target_audience = $14,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $15
        RETURNING *
      `;

      const updateValues = [
        value.title,
        value.description,
        value.short_description || null,
        value.category_id,
        value.level,
        value.price,
        value.currency || 'USD',
        value.thumbnail_url || null,
        value.preview_video_url || null,
        value.duration_hours || 0,
        value.language || 'es',
        value.requirements || [],
        value.what_you_learn || [],
        value.target_audience || [],
        id
      ];

      const result = await db.query(updateQuery, updateValues);
      const updatedCourse = result.rows[0];

      res.json({
        success: true,
        message: 'Curso actualizado exitosamente',
        data: updatedCourse
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el curso'
      });
    }
  },

  // Eliminar curso
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que el curso existe
      const checkQuery = 'SELECT id FROM courses WHERE id = $1';
      const checkResult = await db.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      // Eliminar el curso (las relaciones se eliminan en cascada)
      const deleteQuery = 'DELETE FROM courses WHERE id = $1';
      await db.query(deleteQuery, [id]);

      res.json({
        success: true,
        message: 'Curso eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el curso'
      });
    }
  },

  // Cambiar estado del curso
  async toggleCourseStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      // Verificar que el curso existe
      const checkQuery = 'SELECT id, status FROM courses WHERE id = $1';
      const checkResult = await db.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }

      // Actualizar el estado del curso
      let updateQuery = `
        UPDATE courses SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP
      `;

      const updateValues = [status, id];

      // Si se está publicando por primera vez, establecer published_at
      if (status === 'published') {
        updateQuery += `, published_at = CASE WHEN published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END`;
      }

      updateQuery += ` WHERE id = $2 RETURNING *`;

      const result = await db.query(updateQuery, updateValues);
      const updatedCourse = result.rows[0];

      const statusMessages = {
        'published': 'publicado',
        'archived': 'archivado',
        'draft': 'guardado como borrador'
      };

      res.json({
        success: true,
        message: `Curso ${statusMessages[status]} exitosamente`,
        data: updatedCourse
      });
    } catch (error) {
      console.error('Error updating course status:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar el estado del curso'
      });
    }
  }
};