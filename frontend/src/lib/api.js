import axios from 'axios';

// Cliente axios con baseURL del proxy de Vite
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Interceptor para adjuntar el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo básico de respuestas/errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Error de red';
    return Promise.reject(new Error(message));
  }
);

export default api;