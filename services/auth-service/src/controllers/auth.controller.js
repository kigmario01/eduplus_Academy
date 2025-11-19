import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

export const register = async (req, res) => {
  try {
    const { name, lastname, email, password, role } = req.body;
    const errors = [];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email inválido');
    }
    if (!password || password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!name || typeof name !== 'string') {
      errors.push('Nombre inválido');
    }
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
    }
    
    // Verificar si el usuario ya existe
    const exists = await User.existsByEmail(email);
    if (exists) {
      return res.status(400).json({ success: false, message: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const hashed = await bcrypt.hash(password, 10);
    
    // Crear usuario o reactivar si existe
    let user;
    try {
      user = await User.create({ 
        name, 
        lastname: lastname || '', 
        email, 
        password: hashed, 
        role: role || 'student' 
      });
    } catch (err) {
      // Manejar duplicado por restricción única
      if (err && err.code === '23505') {
        user = await User.reactivateByEmail(email, { name, lastname: lastname || '', password: hashed, role: role || 'student' });
      } else {
        throw err;
      }
    }

    res.status(201).json({ 
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: "Error al registrar", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('🔄 Intento de login para:', req.body.email);
    
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    console.log('✅ Usuario encontrado:', user.email);

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Contraseña inválida para:', email);
      return res.status(401).json({ success: false, message: "Contraseña inválida" });
    }

    console.log('✅ Contraseña válida para:', email);

    // Actualizar último login
    await User.updateLastLogin(user.id);

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: "1d" }
    );

    console.log('✅ Login exitoso para:', email);

    res.json({ 
      success: true,
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        lastname: user.lastname,
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ success: false, message: "Error en el login", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    console.log('📋 Solicitando lista de usuarios');
    
    // Obtener todos los usuarios (sin contraseñas)
    const users = await User.findAll();
    
    console.log(`✅ Se encontraron ${users.length} usuarios`);
    
    res.json({
      success: true,
      message: "Lista de usuarios obtenida exitosamente",
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: "Error al obtener usuarios", error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    if (!googleClientId || !googleClient) {
      return res.status(500).json({
        success: false,
        message: "Google login no está configurado",
        hint: "Falta GOOGLE_CLIENT_ID en el entorno del auth-service",
      });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Falta el token de Google (credential)" });
    }

    // Verificar el ID token de Google
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const emailVerified = !!payload?.email_verified;
    const givenName = payload?.given_name || payload?.name || "";
    const familyName = payload?.family_name || "";

    if (!email) {
      return res.status(400).json({ success: false, message: "El token de Google no contiene un email válido" });
    }

    // Buscar o crear usuario
    let user = await User.findOne({ email });
    if (!user) {
      // Generar contraseña aleatoria para cumplir con el esquema
      const randomSecret = `${email}-${Date.now()}-${Math.random()}`;
      const hashed = await bcrypt.hash(randomSecret, 10);
      user = await User.create({
        name: givenName,
        lastname: familyName,
        email,
        password: hashed,
        role: "student",
        email_verified: emailVerified,
      });
    }

    // Actualizar último acceso
    await User.updateLastLogin(user.id);

    // Generar token propio
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error en login con Google:", error);
    return res.status(500).json({ success: false, message: "Error en login con Google", error: error.message });
  }
};

export const validateToken = async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ valid: false, message: 'Falta token' });
    }
    const token = auth.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ valid: false, message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ valid: true, user: { email: user.email, role: user.role, id: user.id } });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Token inválido' });
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  // Política: no revelar existencia del correo
  return res.status(200).json({ success: true, message: 'Si el email existe, se enviará un enlace de recuperación' });
};