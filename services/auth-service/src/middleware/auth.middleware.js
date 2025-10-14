import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Token de acceso requerido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eduplus_secret_key');
    
    // Verificar que el usuario aún existe en la base de datos
    const { rows } = await pool.query(
      'SELECT id, name, lastname, email, role FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: "Token inválido" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: "Token expirado" });
    }
    
    console.error("Error en autenticación:", error);
    return res.status(500).json({ error: "Error de autenticación" });
  }
};