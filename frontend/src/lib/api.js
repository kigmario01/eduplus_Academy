import axios from 'axios';

// Configuración de URLs para diferentes servicios
const isDevelopment = import.meta.env.DEV;

// URLs base para cada servicio
const AUTH_SERVICE_URL = isDevelopment 
  ? '/api/auth' 
  : import.meta.env.VITE_AUTH_SERVICE_URL || 'https://your-auth-service.onrender.com';

const COURSE_SERVICE_URL = isDevelopment 
  ? '/api' 
  : import.meta.env.VITE_COURSE_SERVICE_URL || 'https://your-course-service.onrender.com';

// Crear instancias de axios para cada servicio
const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 15000,
});

const courseApi = axios.create({
  baseURL: COURSE_SERVICE_URL,
  timeout: 15000,
});

// API principal (mantiene compatibilidad)
const api = axios.create({
  baseURL: isDevelopment ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
  timeout: 15000,
});

// Función para configurar interceptors
const setupInterceptors = (apiInstance) => {
  // Interceptor para adjuntar el token
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Manejo básico de respuestas/errores
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message = error?.response?.data?.message || error.message || 'Error de red';
      return Promise.reject(new Error(message));
    }
  );
};

// Aplicar interceptors a todas las instancias
setupInterceptors(api);
setupInterceptors(authApi);
setupInterceptors(courseApi);

// Exportar APIs
export default api;
export { authApi, courseApi, AUTH_SERVICE_URL, COURSE_SERVICE_URL };