import pool from '../config/db.js';

class User {
  // Buscar usuario por email
  static async findOne({ email }) {
    const query = `
      SELECT id, nombre, apellido, correo_electronico, contraseña, rol, es_activo, email_verificado, creado_at
      FROM usuarios 
      WHERE correo_electronico = $1 AND es_activo = true
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      const client = await pool.connect();
      const { name, lastname, email, password, role = 'student' } = userData;
      
      const query = `
        INSERT INTO usuarios (nombre, apellido, correo_electronico, contraseña, rol, es_activo, email_verificado, creado_at, actualizado_at)
        VALUES ($1, $2, $3, $4, $5, true, false, NOW(), NOW())
        RETURNING id, nombre, apellido, correo_electronico, rol, es_activo, email_verificado, creado_at
      `;
      
      const values = [name, lastname, email, password, role];
      const result = await client.query(query, values);
      client.release();
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    const query = `
      SELECT id, nombre, apellido, correo_electronico, rol, es_activo, email_verificado, creado_at
      FROM usuarios 
      WHERE id = $1 AND es_activo = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Actualizar último login
  static async updateLastLogin(id) {
    const query = `
      UPDATE usuarios 
      SET actualizado_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }

  // Verificar si existe un usuario con el email
  static async existsByEmail(email) {
    const query = `
      SELECT COUNT(*) as count
      FROM usuarios 
      WHERE correo_electronico = $1 AND es_activo = true
    `;
    
    const result = await pool.query(query, [email]);
    return parseInt(result.rows[0].count) > 0;
  }

  // Obtener todos los usuarios (sin contraseñas)
  static async findAll() {
    const query = `
      SELECT id, nombre, apellido, correo_electronico, rol, es_activo, email_verificado, creado_at, actualizado_at
      FROM usuarios 
      WHERE es_activo = true
      ORDER BY creado_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}

export default User;