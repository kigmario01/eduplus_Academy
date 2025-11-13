import axios from 'axios';

// Configuración de URLs para diferentes servicios
const isDevelopment = import.meta.env.DEV;

const DEFAULT_AUTH_SERVICE_URL = 'https://eduplus-auth-service.onrender.com/api/auth';
const DEFAULT_COURSE_SERVICE_URL = 'https://eduplus-course-service.onrender.com/api';
const DEFAULT_EVALUATION_SERVICE_URL = 'https://eduplus-evaluation-service.onrender.com/api/evaluations';

// URLs base para cada servicio
const AUTH_SERVICE_URL = isDevelopment
  ? '/api/auth'
  : import.meta.env.VITE_AUTH_SERVICE_URL || DEFAULT_AUTH_SERVICE_URL;

const COURSE_SERVICE_URL = isDevelopment
  ? '/api'
  : import.meta.env.VITE_COURSE_SERVICE_URL || DEFAULT_COURSE_SERVICE_URL;

const EVALUATION_SERVICE_URL = isDevelopment
  ? '/api/evaluations'
  : import.meta.env.VITE_EVALUATION_SERVICE_URL || DEFAULT_EVALUATION_SERVICE_URL;

// Crear instancias de axios para cada servicio
const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 15000,
});

const courseApi = axios.create({
  baseURL: COURSE_SERVICE_URL,
  timeout: 15000,
});

const evaluationApi = axios.create({
  baseURL: EVALUATION_SERVICE_URL,
  timeout: 15000,
});

// Cliente para endpoints de usuarios en auth-service (/api/users)
const USER_SERVICE_URL = isDevelopment
  ? '/api/users'
  : import.meta.env.VITE_USER_SERVICE_URL
    || (import.meta.env.VITE_AUTH_SERVICE_URL
      ? import.meta.env.VITE_AUTH_SERVICE_URL.replace('/api/auth', '/api/users')
      : DEFAULT_AUTH_SERVICE_URL.replace('/api/auth', '/api/users'));

const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  timeout: 15000,
});

// API principal (mantiene compatibilidad)
const api = axios.create({
  baseURL: COURSE_SERVICE_URL,
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
    // Adjuntar CSRF para métodos mutantes
    const isMutating = ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase());
    if (isMutating) {
      const csrf = localStorage.getItem('csrfToken');
      if (csrf) {
        config.headers['X-CSRF-Token'] = csrf;
      }
    }
    return config;
  });

  // Manejo básico de respuestas/errores
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error?.config || {};
      const isNetworkError = !error.response;
      const status = error?.response?.status;
      const method = (config.method || '').toLowerCase();
      const shouldRetry = method === 'get' && (isNetworkError || (status && status >= 500));

      // Reintentos exponenciales (máx 3) solo para GET idempotentes
      if (shouldRetry) {
        config.__retryCount = (config.__retryCount || 0) + 1;
        if (config.__retryCount <= 3) {
          const delayMs = Math.min(2000, 250 * Math.pow(2, config.__retryCount - 1)) + Math.round(Math.random() * 150);
          await new Promise((r) => setTimeout(r, delayMs));
          try {
            return await apiInstance.request(config);
          } catch (e) {
            // seguirá al manejo final abajo
            error = e;
          }
        }
      }

      const message = isNetworkError
        ? 'No se pudo conectar con el servidor. Verifica tu conexión.'
        : (error?.response?.data?.message || error.message || 'Error de red');
      return Promise.reject(new Error(message));
    }
  );
};

// Aplicar interceptors a todas las instancias
setupInterceptors(api);
setupInterceptors(authApi);
setupInterceptors(courseApi);
setupInterceptors(evaluationApi);
setupInterceptors(userApi);

// Exportar APIs
export default api;
export { authApi, courseApi, evaluationApi, userApi, AUTH_SERVICE_URL, COURSE_SERVICE_URL, EVALUATION_SERVICE_URL };
// Inicializar CSRF: obtiene y guarda token para mutaciones
export const initCsrf = async () => {
  try {
    const resp = await courseApi.get('/csrf-token');
    const token = resp?.data?.token;
    if (token) localStorage.setItem('csrfToken', token);
  } catch (e) {
    console.warn('No se pudo inicializar CSRF:', e?.message || e);
  }
};