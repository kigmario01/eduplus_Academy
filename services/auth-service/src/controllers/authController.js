import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

export const registerUser = async (req, res) => {
  try {
    const { name, lastname = null, email, password, role = "student" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const exists = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, lastname, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, lastname, email, role, created_at`,
      [name, lastname, email, hashed, role]
    );

    return res.status(201).json({ message: "Usuario creado", user: result.rows[0] });
  } catch (err) {
    console.error("🔥 Error en registro:", err);
    return res.status(500).json({ error: "Error al registrar usuario", detail: err.message });
  }
};