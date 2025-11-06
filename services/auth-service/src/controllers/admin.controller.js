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
      whereClause += ` AND (name ILIKE $${paramCount} OR lastname ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Validar campo de ordenamiento
    const allowedSortFields = ['created_at', 'name', 'lastname', 'email', 'role'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Query para obtener usuarios
    const usersQuery = `
      SELECT 
        id, 
        name, 
        lastname, 
        email, 
        role, 
        is_active, 
        email_verified, 
        avatar_url,
        bio,
        created_at, 
        updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Query para contar total de usuarios
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users 
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
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    // Incluir usuarios inactivos para administración
    const result = await pool.query(
      `SELECT id, name, lastname, email, role, is_active, email_verified, bio, avatar_url, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
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
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    const updates = req.body;

    // Verificar que el usuario existe
    const existingCheck = await pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
    if (existingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    const existingUser = existingCheck.rows[0];

    // Prevenir que un admin se desactive a sí mismo
    if (req.user.id === parseInt(id) && updates.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    // Si se está actualizando el email, verificar que no exista
    if (updates.email && updates.email !== existingUser.email) {
      const emailDup = await pool.query('SELECT 1 FROM users WHERE email = $1', [updates.email]);
      if (emailDup.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Si se está actualizando la contraseña, hashearla
    let passwordHash = null;
    if (updates.password) {
      passwordHash = await bcrypt.hash(updates.password, 10);
    }

    // Construir SQL dinámico con campos permitidos
    const allowedFields = ['name', 'lastname', 'email', 'role', 'is_active', 'email_verified', 'bio', 'avatar_url'];
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        setClauses.push(`${field} = $${idx}`);
        values.push(updates[field]);
        idx++;
      }
    }

    if (passwordHash) {
      setClauses.push(`password = $${idx}`);
      values.push(passwordHash);
      idx++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
    }

    // Always update updated_at
    setClauses.push(`updated_at = NOW()`);
    values.push(userId);

    const updateSql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, name, lastname, email, role, is_active, email_verified, bio, avatar_url, created_at, updated_at`;
    const updateResult = await pool.query(updateSql, values);
    const userResponse = updateResult.rows[0];

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
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    const { permanent = false } = req.query;

    // Verificar que el usuario existe
    const existingCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (existingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Prevenir que un admin se elimine a sí mismo
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    if (String(permanent) === 'true') {
      // Eliminación permanente
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      return res.json({
        success: true,
        message: 'Usuario eliminado permanentemente'
      });
    }
    // Soft delete - desactivar
    await pool.query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [userId]);
    return res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });

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
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }
    const result = await pool.query(
      'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id, name, lastname, email, role, is_active, email_verified, bio, avatar_url, created_at, updated_at',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario reactivado exitosamente',
      data: result.rows[0]
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
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
        COUNT(CASE WHEN role = 'instructor' THEN 1 END) as total_instructors,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_month
      FROM users
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