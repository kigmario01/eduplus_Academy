import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, lastname, email, password, role } = req.body;
    
    // Verificar si el usuario ya existe
    const exists = await User.existsByEmail(email);
    if (exists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashed = await bcrypt.hash(password, 10);
    
    // Crear el usuario
    const user = await User.create({ 
      name, 
      lastname, 
      email, 
      password: hashed, 
      role: role || 'student' 
    });

    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
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
    res.status(500).json({ message: "Error al registrar", error: error.message });
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
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log('✅ Usuario encontrado:', user.email);

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Contraseña inválida para:', email);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    console.log('✅ Contraseña válida para:', email);

    // Actualizar último login
    await User.updateLastLogin(user.id);

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: "1d" }
    );

    console.log('✅ Login exitoso para:', email);

    res.json({ 
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
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    console.log('📋 Solicitando lista de usuarios');
    
    // Obtener todos los usuarios (sin contraseñas)
    const users = await User.findAll();
    
    console.log(`✅ Se encontraron ${users.length} usuarios`);
    
    res.json({
      message: "Lista de usuarios obtenida exitosamente",
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};