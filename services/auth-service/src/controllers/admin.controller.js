import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

// Obtener todos los usuarios con paginación y filtros
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      search, 
      isActive,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir query base
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    // Filtro por rol
    if (role && role !== 'all') {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      queryParams.push(role);
    }

    // Filtro por estado activo
    if (isActive !== undefined) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      queryParams.push(isActive === 'true');
    }

    // Filtro de búsqueda
    if (search) {
      paramCount++;
      whereClause += ` AND (nombre ILIKE $${paramCount} OR apellido ILIKE $${paramCount} OR correo_electronico ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Validar campo de ordenamiento
    const allowedSortFields = ['creado_at', 'nombre', 'apellido', 'correo_electronico', 'rol'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'creado_at';
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Query para obtener usuarios
    const usersQuery = `
      SELECT 
        id, 
        nombre, 
        apellido, 
        correo_electronico, 
        rol, 
        es_activo, 
        email_verificado, 
        profile_image_url,
        bio,
        creado_at, 
        actualizado_at
      FROM usuarios 
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM usuarios 
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      pool.query(usersQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      users: usersResult.rows,
      total,
      page: parseInt(page),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      filters: {
        role,
        search,
        isActive,
        sortBy: validSortBy,
        sortOrder: validSortOrder
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// Crear nuevo usuario
export const createUser = async (req, res) => {
  try {
    const { 
      name, 
      lastname, 
      email, 
      password, 
      role = 'student',
      isActive = true,
      emailVerified = false,
      bio = null,
      profileImageUrl = null
    } = req.body;

    // Validaciones
    if (!name || !lastname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellido, email y contraseña son obligatorios'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.existsByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      name,
      lastname,
      email,
      password: hashedPassword,
      role,
      isActive,
      emailVerified,
      bio,
      profileImageUrl
    });

    // Remover password de la respuesta
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar que el usuario existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Prevenir que un admin se desactive a sí mismo
    if (req.user.id === parseInt(id) && updates.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    // Si se está actualizando el email, verificar que no exista
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await User.existsByEmail(updates.email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Actualizar usuario
    const updatedUser = await User.update(id, updates);

    // Remover password de la respuesta
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userResponse
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// Eliminar usuario (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    // Verificar que el usuario existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Prevenir que un admin se elimine a sí mismo
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    if (permanent === 'true') {
      // Eliminación permanente (solo para casos extremos)
      await User.delete(id);
      res.json({
        success: true,
        message: 'Usuario eliminado permanentemente'
      });
    } else {
      // Soft delete - solo desactivar
      await User.update(id, { isActive: false });
      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente'
      });
    }

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// Reactivar usuario
export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.update(id, { isActive: true });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario reactivado exitosamente',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error reactivando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reactivar usuario',
      error: error.message
    });
  }
};

// Obtener estadísticas de usuarios
export const getUserStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN rol = 'student' THEN 1 END) as total_students,
        COUNT(CASE WHEN rol = 'instructor' THEN 1 END) as total_instructors,
        COUNT(CASE WHEN rol = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN es_activo = true THEN 1 END) as active_users,
        COUNT(CASE WHEN email_verificado = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN creado_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_month
      FROM usuarios
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    // Convertir strings a números
    const formattedStats = {
      totalUsers: parseInt(stats.total_users),
      totalStudents: parseInt(stats.total_students),
      totalInstructors: parseInt(stats.total_instructors),
      totalAdmins: parseInt(stats.total_admins),
      activeUsers: parseInt(stats.active_users),
      verifiedUsers: parseInt(stats.verified_users),
      newUsersLastMonth: parseInt(stats.new_users_last_month)
    };

    res.json({
      success: true,
      data: formattedStats
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