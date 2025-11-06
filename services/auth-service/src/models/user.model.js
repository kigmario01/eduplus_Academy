import pool from '../config/db.js';

class User {
  // Buscar usuario por email
  static async findOne({ email }) {
    const query = `
      SELECT id, name, lastname, email, password, role, is_active, email_verified, created_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      const client = await pool.connect();
      const { name, lastname, email, password, role = 'student', email_verified = false } = userData;
      
      const query = `
        INSERT INTO users (name, lastname, email, password, role, is_active, email_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())
        RETURNING id, name, lastname, email, role, is_active, email_verified, created_at
      `;
      
      const values = [name, lastname, email, password, role, email_verified];
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
      SELECT id, name, lastname, email, role, is_active, email_verified, created_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Actualizar último login
  static async updateLastLogin(id) {
    const query = `
      UPDATE users 
      SET updated_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }

  // Verificar si existe un usuario con el email
  static async existsByEmail(email) {
    const query = `
      SELECT COUNT(*) as count
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [email]);
    return parseInt(result.rows[0].count) > 0;
  }

  // Obtener todos los usuarios (sin contraseñas)
  static async findAll() {
    const query = `
      SELECT id, name, lastname, email, role, is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}

export default User;