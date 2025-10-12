import axios from 'axios';

// Usa VITE_API_URL en builds (Docker/CI) y fallback al proxy /api en dev
const baseURL = import.meta?.env?.VITE_API_URL || '/api';
const api = axios.create({
  baseURL,
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