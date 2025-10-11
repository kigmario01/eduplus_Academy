import { pool } from "../server.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { name, lastname, email, password, role } = req.body;
    
    // Validación básica
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }
    
    const hashed = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, lastname, email, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, lastname, email, role
    `;
    const result = await pool.query(query, [name, lastname || '', email, hashed, role || 'student']);

    res.status(201).json({ 
      message: "Usuario creado correctamente", 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    res.status(500).json({ 
      error: "Error al registrar usuario", 
      detail: error.message 
    });
  }
};