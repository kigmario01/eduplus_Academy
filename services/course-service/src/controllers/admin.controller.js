import db from '../config/db.js';

// Obtener todos los cursos con información detallada para administración
export const getAllCoursesAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      instructor,
      search, 
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir query base
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    // Filtro por estado
    if (status && status !== 'all') {
      paramCount++;
      whereClause += ` AND c.status = $${paramCount}`;
      queryParams.push(status);
    }

    // Filtro por categoría
    if (category && category !== 'all') {
      paramCount++;
      whereClause += ` AND c.category_id = $${paramCount}`;
      queryParams.push(parseInt(category));
    }

    // Filtro por instructor
    if (instructor && instructor !== 'all') {
      paramCount++;
      whereClause += ` AND c.instructor_id = $${paramCount}`;
      queryParams.push(parseInt(instructor));
    }

    // Filtro de búsqueda
    if (search) {
      paramCount++;
      whereClause += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Validar campo de ordenamiento
    const allowedSortFields = ['created_at', 'title', 'price', 'duration_hours', 'status'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Query para obtener cursos con información completa
    const coursesQuery = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.duration_hours,
        c.level,
        c.status,
        c.thumbnail_url,
        c.created_at,
        c.updated_at,
        cat.name as category_name,
        u.first_name || ' ' || u.last_name as instructor_name,
        u.email as instructor_email,
        COUNT(DISTINCT e.id) as total_enrollments,
        AVG(r.rating) as average_rating,
        COUNT(DISTINCT r.id) as total_reviews
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_enrollments e ON c.id = e.course_id
      LEFT JOIN course_reviews r ON c.id = r.course_id
      ${whereClause}
      GROUP BY c.id, cat.name, u.first_name, u.last_name, u.email
      ORDER BY c.${validSortBy} ${validSortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Query para contar total
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total 
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.instructor_id = u.id
      ${whereClause}
    `;

    const [coursesResult, countResult] = await Promise.all([
      db.query(coursesQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Formatear datos
    const courses = coursesResult.rows.map(course => ({
      ...course,
      total_enrollments: parseInt(course.total_enrollments) || 0,
      average_rating: course.average_rating ? parseFloat(course.average_rating).toFixed(1) : null,
      total_reviews: parseInt(course.total_reviews) || 0
    }));

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        status,
        category,
        instructor,
        search,
        sortBy: validSortBy,
        sortOrder: validSortOrder
      }
    });

  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos',
      error: error.message
    });
  }
};

// Crear nuevo curso
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      duration_hours,
      level,
      categoryId,
      instructorId,
      imageUrl,
      status = 'draft'
    } = req.body;

    // Validaciones
    if (!title || !description || !categoryId || !instructorId) {
      return res.status(400).json({
        success: false,
        message: 'Título, descripción, categoría e instructor son obligatorios'
      });
    }

    // Verificar que el instructor existe y tiene el rol correcto
    const instructorCheck = await db.query(
      'SELECT id, role FROM users WHERE id = $1 AND role IN ($2, $3)',
      [instructorId, 'instructor', 'admin']
    );

    if (instructorCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El instructor especificado no existe o no tiene permisos'
      });
    }

    // Verificar que la categoría existe
    const categoryCheck = await db.query(
      'SELECT id FROM course_categories WHERE id = $1',
      [categoryId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La categoría especificada no existe'
      });
    }

    // Crear curso
    const result = await db.query(`
      INSERT INTO courses (
        title, description, price, duration_hours, level, 
        category_id, instructor_id, thumbnail_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, description, price, duration_hours, level, categoryId, instructorId, imageUrl, status]);

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear curso',
      error: error.message
    });
  }
};

// Actualizar curso
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar que el curso existe
    const existingCourse = await db.query(
      'SELECT * FROM courses WHERE id = $1',
      [id]
    );

    if (existingCourse.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Si se está actualizando el instructor, verificar que existe
    if (updates.instructorId) {
      const instructorCheck = await db.query(
        'SELECT id, role FROM users WHERE id = $1 AND role IN ($2, $3)',
        [updates.instructorId, 'instructor', 'admin']
      );

      if (instructorCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El instructor especificado no existe o no tiene permisos'
        });
      }
    }

    // Si se está actualizando la categoría, verificar que existe
    if (updates.categoryId) {
      const categoryCheck = await db.query(
        'SELECT id FROM course_categories WHERE id = $1',
        [updates.categoryId]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe'
        });
      }
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    const allowedFields = [
      'title', 'description', 'price', 'duration_hours', 'level',
      'categoryId', 'instructorId', 'imageUrl', 'status'
    ];

    const fieldMapping = {
      categoryId: 'category_id',
      instructorId: 'instructor_id',
      imageUrl: 'thumbnail_url'
    };

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        paramCount++;
        const dbField = fieldMapping[key] || key;
        updateFields.push(`${dbField} = $${paramCount}`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
    }

    // Agregar updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    // Agregar ID para WHERE clause
    paramCount++;
    updateValues.push(id);

    const updateQuery = `
      UPDATE courses 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar curso',
      error: error.message
    });
  }
};

// Eliminar curso
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    // Verificar que el curso existe
    const existingCourse = await db.query(
      'SELECT * FROM courses WHERE id = $1',
      [id]
    );

    if (existingCourse.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar si hay inscripciones activas
    const enrollmentsCheck = await db.query(
      'SELECT COUNT(*) as count FROM course_enrollments WHERE course_id = $1',
      [id]
    );

    const enrollmentCount = parseInt(enrollmentsCheck.rows[0].count);

    if (permanent === 'true') {
      if (enrollmentCount > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar permanentemente. El curso tiene ${enrollmentCount} inscripciones activas`
        });
      }

      // Eliminación permanente
      await db.query('DELETE FROM courses WHERE id = $1', [id]);
      res.json({
        success: true,
        message: 'Curso eliminado permanentemente'
      });
    } else {
      // Soft delete - cambiar estado a 'deleted'
      await db.query(
        'UPDATE courses SET status = $1, updated_at = $2 WHERE id = $3',
        ['deleted', new Date(), id]
      );
      res.json({
        success: true,
        message: 'Curso marcado como eliminado',
        enrollments: enrollmentCount
      });
    }

  } catch (error) {
    console.error('Error eliminando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar curso',
      error: error.message
    });
  }
};

// Restaurar curso eliminado
export const restoreCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE courses SET status = $1, updated_at = $2 WHERE id = $3 AND status = $4 RETURNING *',
      ['draft', new Date(), id, 'deleted']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado o no está eliminado'
      });
    }

    res.json({
      success: true,
      message: 'Curso restaurado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error restaurando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restaurar curso',
      error: error.message
    });
  }
};

// Obtener estadísticas de cursos
export const getCourseStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_courses,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_courses,
        COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted_courses,
        AVG(price) as average_price,
        SUM(CASE WHEN price > 0 THEN 1 ELSE 0 END) as paid_courses,
        SUM(CASE WHEN price = 0 THEN 1 ELSE 0 END) as free_courses,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_courses_last_month
      FROM courses
    `;

    const enrollmentStatsQuery = `
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(DISTINCT course_id) as courses_with_enrollments,
        AVG(enrollments_per_course) as avg_enrollments_per_course
      FROM (
        SELECT course_id, COUNT(*) as enrollments_per_course
        FROM course_enrollments
        GROUP BY course_id
      ) as course_enrollment_counts
    `;

    const [statsResult, enrollmentStatsResult] = await Promise.all([
      db.query(statsQuery),
      db.query(enrollmentStatsQuery)
    ]);

    const stats = statsResult.rows[0];
    const enrollmentStats = enrollmentStatsResult.rows[0];

    // Convertir strings a números y formatear
    Object.keys(stats).forEach(key => {
      if (key === 'average_price') {
        stats[key] = stats[key] ? parseFloat(stats[key]).toFixed(2) : '0.00';
      } else {
        stats[key] = parseInt(stats[key]) || 0;
      }
    });

    Object.keys(enrollmentStats).forEach(key => {
      if (key === 'avg_enrollments_per_course') {
        enrollmentStats[key] = enrollmentStats[key] ? parseFloat(enrollmentStats[key]).toFixed(1) : '0.0';
      } else {
        enrollmentStats[key] = parseInt(enrollmentStats[key]) || 0;
      }
    });

    res.json({
      success: true,
      data: {
        ...stats,
        ...enrollmentStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};