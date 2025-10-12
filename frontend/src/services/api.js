// Base URL para la API:
// - En desarrollo utiliza el proxy Vite: '/api' (configurado en vite.config.js)
// - En producción define la variable de entorno VITE_API_URL en Vercel apuntando al backend (ej: https://eduplus-academy.onrender.com/api)
// Ejemplo en Vercel: VITE_API_URL = https://eduplus-academy.onrender.com/api
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Usar la instancia central de axios definida en src/lib/api.js
import api from '../lib/api';

// Interceptor para añadir token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      if (import.meta.env.DEV) {
        console.debug('API (dev) register ->', API_BASE + '/auth/register');
        console.debug('API (dev) payload:', userData);
      }
      const response = await api.post('/auth/register', userData);
      if (import.meta.env.DEV) console.debug('API (dev) register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error de registro:', error);
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        throw error.response.data || { message: `Error del servidor: ${error.response.status}` };
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        throw { message: 'No se recibió respuesta del servidor. Verifica tu conexión.' };
      } else {
        // Ocurrió un error al configurar la solicitud
        throw { message: `Error al enviar la solicitud: ${error.message}` };
      }
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      if (import.meta.env.DEV) {
        console.debug('API (dev) login ->', API_BASE + '/auth/login');
        console.debug('API (dev) credentials:', { email: credentials.email, password: '******' });
      }
      const response = await api.post('/auth/login', credentials);
      if (import.meta.env.DEV) console.debug('API (dev) login response:', response.data);
      // Guardar token y datos de usuario en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error.response?.data || { message: 'Error en el servidor' };
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};

export default api; // Exponer api por defecto al final