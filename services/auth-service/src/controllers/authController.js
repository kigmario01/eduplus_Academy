import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const registerUser = async (req, res) => {
  try {
    const { name, lastname = null, email, password, role = "student" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Normaliza el email para evitar problemas de casing o espacios
    const normalizedEmail = email.trim().toLowerCase();

    const exists = await pool.query("SELECT 1 FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, lastname, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, lastname, email, role, created_at`,
      [name, lastname, normalizedEmail, hashed, role]
    );

    return res.status(201).json({ message: "Usuario creado", user: result.rows[0] });
  } catch (err) {
    console.error("🔥 Error en registro:", err);
    return res.status(500).json({ error: "Error al registrar usuario", detail: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan email y/o contraseña" });
    }

    // Normaliza el email para evitar problemas de casing o espacios
    const normalizedEmail = email.trim().toLowerCase();

    const { rows } = await pool.query(
      `SELECT id, name, lastname, email, password, role 
       FROM users 
       WHERE LOWER(email) = $1 
       LIMIT 1`, 
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'eduplus_secret_key',
      { expiresIn: "1d" }
    );

    // no devolver el hash
    delete user.password;

    return res.status(200).json({ message: "Login ok", token, user });
  } catch (err) {
    console.error("🔥 Error en login:", err);
    return res
      .status(500)
      .json({ error: "Error al iniciar sesión", detail: err.message });
  }
};