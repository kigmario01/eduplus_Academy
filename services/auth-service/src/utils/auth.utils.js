// Utilidades de autenticación
// Incluye funciones para hashear y comparar contraseñas, y generar tokens JWT

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

export function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return jwt.sign(payload, secret, { expiresIn: '1d' });
}