import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: "Token de acceso requerido",
        error: "UNAUTHORIZED" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verificar que el usuario aún existe y está activo
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: "Usuario no encontrado o inactivo",
        error: "USER_NOT_FOUND" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Token inválido",
        error: "INVALID_TOKEN" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expirado",
        error: "TOKEN_EXPIRED" 
      });
    }

    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: "INTERNAL_ERROR" 
    });
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Usuario no autenticado",
        error: "NOT_AUTHENTICATED" 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Acceso denegado. Se requieren privilegios de administrador",
        error: "INSUFFICIENT_PRIVILEGES",
        userRole: req.user.role,
        requiredRole: 'admin'
      });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de rol admin:', error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      error: "INTERNAL_ERROR" 
    });
  }
};

// Middleware para verificar roles específicos
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: "Usuario no autenticado",
          error: "NOT_AUTHENTICATED" 
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: "Acceso denegado. Rol insuficiente",
          error: "INSUFFICIENT_PRIVILEGES",
          userRole: req.user.role,
          allowedRoles: allowedRoles
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificación de rol:', error);
      return res.status(500).json({ 
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR" 
      });
    }
  };
};

// Middleware combinado: autenticación + autorización admin
export const adminAuth = [authenticateToken, requireAdmin];

// Middleware para logging de acciones administrativas
export const logAdminAction = (action) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userInfo = req.user ? `${req.user.name} (ID: ${req.user.id})` : 'Usuario desconocido';
    
    console.log(`🔐 [ADMIN ACTION] ${timestamp} - ${action} - Usuario: ${userInfo} - IP: ${req.ip}`);
    
    // Agregar información de auditoría a la request
    req.auditLog = {
      action,
      timestamp,
      userId: req.user?.id,
      userEmail: req.user?.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    next();
  };
};