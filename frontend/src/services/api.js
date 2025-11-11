import axios from 'axios';

// Configuración de URL para diferentes entornos
// En desarrollo usamos ruta relativa para aprovechar el proxy de Vite.
// Si el servicio local está caído, hacemos failover automático a producción.
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_PRIMARY = isDevelopment
  ? '/api/auth'
  : 'https://eduplus-academy.onrender.com/api/auth';
const API_FALLBACK = 'https://eduplus-academy.onrender.com/api/auth';

// Crear instancias de axios (primaria y fallback)
const apiPrimary = axios.create({
  baseURL: API_PRIMARY,
  timeout: 30000, // 30 segundos de timeout
  headers: { 'Content-Type': 'application/json' },
});

const apiFallback = axios.create({
  baseURL: API_FALLBACK,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para añadir token a las peticiones (aplicado en ambas instancias)
const attachAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiPrimary.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
apiFallback.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// Helper: obtener mensaje de error amigable desde Axios/servidor
const getErrorMessage = (error, fallbackMessage = 'Error en el servidor') => {
  try {
    const resp = error?.response;
    const data = resp?.data;
    const directMsg = error?.message;
    const status = resp?.status;

    const serverMsg =
      (typeof data === 'string' ? data : null) ||
      data?.message ||
      data?.error ||
      data?.detail;

    const msg = serverMsg || directMsg || fallbackMessage;
    if (status && !serverMsg && !directMsg) {
      return `${fallbackMessage}: ${status}`;
    }
    return msg;
  } catch (_) {
    return fallbackMessage;
  }
};

// Criterio robusto para activar fallback en desarrollo cuando el proxy falla
const shouldFallback = (error) => {
  // Sin respuesta del servidor
  if (!error?.response) return true;
  const status = error.response.status;
  const msg = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();
  // Errores típicos de proxy/servidor caído
  const proxyStatuses = [404, 500, 502, 503, 504];
  const networkHints = [
    'network error',
    'ecconnrefused',
    'econnrefused',
    'connect econnrefused',
  ];
  const hasProxyStatus = proxyStatuses.includes(Number(status));
  const hasNetworkHint = networkHints.some((h) => msg.includes(h) || code.includes(h));
  return isDevelopment && (hasProxyStatus || hasNetworkHint);
};

// Servicios de autenticación
export const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      console.log('🔄 Intentando registrar usuario (primario):', API_PRIMARY + '/register');
      const response = await apiPrimary.post('/register', userData);
      console.log('✅ Respuesta recibida:', response.data);
      return response.data;
    } catch (error) {
      // Intentar failover a producción en caso de error de red/proxy en desarrollo
      if (shouldFallback(error)) {
        console.warn('⚠️ Registro falló contra primario. Probando fallback:', API_FALLBACK + '/register');
        try {
          const fallbackRes = await apiFallback.post('/register', userData);
          console.log('✅ Registro por fallback exitoso:', fallbackRes.data);
          return fallbackRes.data;
        } catch (fallbackErr) {
          console.error('❌ Fallback de registro también falló:', fallbackErr);
          throw new Error(getErrorMessage(fallbackErr, 'No se pudo registrar. Servicio de autenticación no disponible.'));
        }
      }
      // Error con respuesta del servidor
      throw new Error(getErrorMessage(error, `Error del servidor: ${error.response?.status || 'desconocido'}`));
    }
  },

  // Login con Google (ID token)
  googleLogin: async (credential) => {
    try {
      console.log('🔄 Intentando login con Google (primario):', API_PRIMARY + '/google');
      const response = await apiPrimary.post('/google', { credential });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (shouldFallback(error)) {
        console.warn('⚠️ Google login contra primario falló. Probando fallback:', API_FALLBACK + '/google');
        try {
          const fallbackRes = await apiFallback.post('/google', { credential });
          if (fallbackRes.data.token) {
            localStorage.setItem('token', fallbackRes.data.token);
            localStorage.setItem('user', JSON.stringify(fallbackRes.data.user));
          }
          return fallbackRes.data;
        } catch (fallbackErr) {
          console.error('❌ Fallback de Google login también falló:', fallbackErr);
          throw new Error(getErrorMessage(fallbackErr, 'Servicio de autenticación no disponible'));
        }
      }
      console.error('❌ Error en login con Google:', error);
      throw new Error(getErrorMessage(error, 'Error en el servidor'));
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      console.log('🔄 Intentando login (primario):', API_PRIMARY + '/login');
      console.log('📤 Credenciales enviadas:', { email: credentials.email, password: '******' });
      const response = await apiPrimary.post('/login', credentials);
      console.log('✅ Login exitoso:', response.data);
      // Guardar token y datos de usuario en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (shouldFallback(error)) {
        console.warn('⚠️ Login contra primario falló. Probando fallback:', API_FALLBACK + '/login');
        try {
          const fallbackRes = await apiFallback.post('/login', credentials);
          console.log('✅ Login exitoso por fallback:', fallbackRes.data);
          if (fallbackRes.data.token) {
            localStorage.setItem('token', fallbackRes.data.token);
            localStorage.setItem('user', JSON.stringify(fallbackRes.data.user));
          }
          return fallbackRes.data;
        } catch (fallbackErr) {
          console.error('❌ Fallback de login también falló:', fallbackErr);
          throw new Error(getErrorMessage(fallbackErr, 'Servicio de autenticación no disponible'));
        }
      }
      console.error('❌ Error en login:', error);
      throw new Error(getErrorMessage(error, 'Error en el servidor'));
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
// Export por defecto (instancia primaria) para usos generales
export default apiPrimary;