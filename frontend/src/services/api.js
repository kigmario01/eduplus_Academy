import axios from 'axios';

// Configuración de URL para diferentes entornos
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://eduplus-academy.onrender.com/api' // URL de tu backend en Render
    : 'http://localhost:4000/api');

// Crear instancia de axios con URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      const response = await api.post('/auth/register', userData);
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
      const response = await api.post('/auth/login', credentials);
      // Guardar token y datos de usuario en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
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

export default api;