import db from '../config/db.js';
import Joi from 'joi';

// Esquema de validación para categorías
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  icon: Joi.string().max(50).optional(),
  is_active: Joi.boolean().default(true)
});

export const categoryController = {
  // Obtener todas las categorías
  async getAllCategories(req, res) {
    try {
      // Ajustado al esquema actual (courses-schema.sql):
      // course_categories no tiene columnas is_active ni sort_order.
      // Se devuelve el listado con conteo de cursos publicados por categoría.
      const query = `
        SELECT 
          cc.id,
          cc.name,
          COUNT(c.id) AS course_count
        FROM course_categories cc
        LEFT JOIN courses c ON cc.id = c.category_id AND c.status = 'published'
        GROUP BY cc.id
        ORDER BY cc.name ASC
      `;

      const result = await db.query(query);

      res.json({
        success: true,
        data: result.rows.map(row => ({
          ...row,
          course_count: parseInt(row.course_count)
        }))
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las categorías'
      });
    }
  },

  // Obtener categoría por ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          cc.*,
          COUNT(c.id) as course_count
        FROM course_categories cc
        LEFT JOIN courses c ON cc.id = c.category_id AND c.status = 'published'
        WHERE cc.id = $1
        GROUP BY cc.id
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          ...result.rows[0],
          course_count: parseInt(result.rows[0].course_count)
        }
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la categoría'
      });
    }
  },

  // Crear nueva categoría
  async createCategory(req, res) {
    try {
      const { error, value } = categorySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { name, description, color, icon, is_active } = value;

      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await db.query(
        'SELECT id FROM course_categories WHERE LOWER(name) = LOWER($1)',
        [name]
      );
      
      if (existingCategory.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }

      // Generar slug
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Obtener el siguiente sort_order
      const sortOrderResult = await db.query(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_sort_order FROM course_categories'
      );
      const sortOrder = sortOrderResult.rows[0].next_sort_order;

      const insertQuery = `
        INSERT INTO course_categories (name, slug, description, color, icon, is_active, sort_order, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        name,
        slug,
        description,
        color,
        icon,
        is_active,
        sortOrder
      ]);

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la categoría'
      });
    }
  },

  // Actualizar categoría
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = categorySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Verificar que la categoría existe
      const categoryCheck = await db.query(
        'SELECT id FROM course_categories WHERE id = $1',
        [id]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      const { name, description, color, icon, is_active } = value;

      // Verificar nombre único (excluyendo la categoría actual)
      if (name) {
        const existingCategory = await db.query(
          'SELECT id FROM course_categories WHERE LOWER(name) = LOWER($1) AND id != $2',
          [name, id]
        );
        
        if (existingCategory.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una categoría con ese nombre'
          });
        }
      }

      // Generar nuevo slug si se cambió el nombre
      let slug;
      if (name) {
        slug = name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }

      const updateQuery = `
        UPDATE course_categories 
        SET 
          name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          color = COALESCE($4, color),
          icon = COALESCE($5, icon),
          is_active = COALESCE($6, is_active),
          updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `;

      const result = await db.query(updateQuery, [
        name,
        slug,
        description,
        color,
        icon,
        is_active,
        id
      ]);

      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la categoría'
      });
    }
  },

  // Eliminar categoría
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // Verificar que la categoría existe
      const categoryCheck = await db.query(
        'SELECT id, name FROM course_categories WHERE id = $1',
        [id]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      // Verificar si hay cursos asociados a esta categoría
      const coursesCheck = await db.query(
        'SELECT COUNT(*) as course_count FROM courses WHERE category_id = $1',
        [id]
      );

      const courseCount = parseInt(coursesCheck.rows[0].course_count);

      if (courseCount > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar la categoría porque tiene ${courseCount} curso(s) asociado(s)`
        });
      }

      // Eliminar la categoría
      await db.query('DELETE FROM course_categories WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la categoría'
      });
    }
  },

  // Obtener cursos de una categoría
  async getCategoryCourses(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status = 'published' } = req.query;

      // Verificar que la categoría existe
      const categoryCheck = await db.query(
        'SELECT id, name FROM course_categories WHERE id = $1',
        [id]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      const offset = (page - 1) * limit;

      const query = `
        SELECT 
          c.*,
          u.first_name as instructor_first_name,
          u.last_name as instructor_last_name,
          u.profile_image as instructor_image,
          COUNT(ce.id) as enrollment_count,
          AVG(cr.rating) as average_rating,
          COUNT(cr.id) as review_count
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.category_id = $1 AND c.status = $2
        GROUP BY c.id, u.first_name, u.last_name, u.profile_image
        ORDER BY c.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await db.query(query, [id, status, limit, offset]);

      // Contar total de cursos
      const countQuery = `
        SELECT COUNT(*) as total
        FROM courses
        WHERE category_id = $1 AND status = $2
      `;

      const countResult = await db.query(countQuery, [id, status]);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: {
          category: categoryCheck.rows[0],
          courses: result.rows.map(row => ({
            ...row,
            enrollment_count: parseInt(row.enrollment_count),
            average_rating: parseFloat(row.average_rating) || 0,
            review_count: parseInt(row.review_count)
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching category courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los cursos de la categoría'
      });
    }
  }
};