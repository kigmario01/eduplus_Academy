import api from './api';

// 🔧 URLs de endpoints
const ENDPOINTS = {
  dashboard: '/api/dashboard/overview',
  profile: '/api/dashboard/profile',
  settings: '/api/dashboard/settings',
};

const isSkippableError = (error) => {
  if (!error) return false;
  const status = error?.response?.status;
  if (status && [404, 405, 204].includes(status)) {
    return true;
  }

  const message = error?.message?.toLowerCase?.() ?? '';
  return message.includes('not found') || message.includes('ruta no encontrada');
};

const fetchFromCandidates = async (candidates, { optional = false, defaultValue = null, errorMessage } = {}) => {
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await candidate.request();
      const payload = candidate.transform ? candidate.transform(response) : response?.data;
      if (payload !== undefined) {
        return payload;
      }
    } catch (error) {
      lastError = error;
      if (isSkippableError(error)) {
        continue;
      }
      throw error;
    }
  }

  if (optional) {
    return defaultValue;
  }

  throw lastError || new Error(errorMessage || 'No se pudo obtener la información solicitada.');
};

const mapSummaryToStats = (summary = {}) => {
  const hours = summary.hoursStudied ?? summary.totalHours ?? summary.hours ?? null;
  const completedCourses = summary.completedCourses ?? summary.coursesCompleted ?? null;
  const activeCourses = summary.activeCourses ?? summary.coursesInProgress ?? summary.enrolledCourses ?? null;
  const achievements = summary.achievements ?? summary.certificates ?? summary.badges ?? null;
  const progress = summary.averageProgress ?? summary.avgProgress ?? summary.progress ?? null;

  const stats = [];

  if (progress !== null && progress !== undefined) {
    const numericProgress = Number(progress);
    const formattedProgress = Number.isFinite(numericProgress)
      ? `${Math.round(numericProgress)}%`
      : typeof progress === 'string'
        ? progress
        : `${progress}%`;
    stats.push({
      id: 'progress',
      title: 'Progreso promedio',
      value: formattedProgress,
      caption: summary.progressCaption || 'Seguimiento de tu avance en tiempo real',
      tone: STAT_TONES[0],
    });
  }

  const numericActiveCourses = Number(activeCourses);
  if (Number.isFinite(numericActiveCourses) || typeof activeCourses === 'string') {
    stats.push({
      id: 'courses',
      title: 'Cursos activos',
      value: Number.isFinite(numericActiveCourses) ? String(numericActiveCourses) : String(activeCourses),
      caption: summary.coursesCaption || 'Cursos en los que estás participando ahora',
      tone: STAT_TONES[1],
    });
  }

  const numericCompletedCourses = Number(completedCourses);
  if (Number.isFinite(numericCompletedCourses)) {
    stats.push({
      id: 'achievements',
      title: 'Cursos completados',
      value: String(numericCompletedCourses),
      caption: summary.completedCaption || 'Logros obtenidos en EduPlus',
      tone: STAT_TONES[2],
    });
  } else if (achievements !== null && achievements !== undefined) {
    const numericAchievements = Number(achievements);
    stats.push({
      id: 'achievements',
      title: 'Logros destacados',
      value: Number.isFinite(numericAchievements) ? String(numericAchievements) : String(achievements),
      caption: summary.completedCaption || 'Reconocimientos obtenidos recientemente',
      tone: STAT_TONES[2],
    });
  }

  if (hours !== null && hours !== undefined) {
    const value = Number(hours);
    const normalized = Number.isFinite(value)
      ? `${Math.round(value)} h`
      : typeof hours === 'string'
        ? hours
        : String(hours);
    stats.push({
      id: 'hours',
      title: 'Horas de estudio',
      value: normalized,
      caption: summary.hoursCaption || 'Tiempo registrado en tu agenda de estudio',
      tone: STAT_TONES[3],
    });
  }

  return stats;
};

const toDateString = (value) => {
  if (!value) return '';
  try {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return String(value);
  }
};

const shouldFallbackToMock = (error) => {
  if (!error) return false;
  const message = (error.message || '').toLowerCase();
  const isOffline = typeof navigator !== 'undefined' && navigator?.onLine === false;
  
  // Detectar errores 404, de red, timeout, o rutas no encontradas
  return isOffline || 
         message.includes('404') || 
         message.includes('network') || 
         message.includes('timeout') ||
         message.includes('ruta no encontrada') ||
         message.includes('not found') ||
         error.response?.status === 404;
};

export const getDashboardOverview = async () => {
  try {
    console.log('🔄 Iniciando carga de datos del dashboard...');

    // Verificar si hay token de autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token de autenticación, redirigiendo al login');
      throw new Error('No hay token de autenticación');
    }

    // Obtener datos reales del dashboard desde la API
    const response = await api.get(ENDPOINTS.dashboard);
    const data = response.data;

    console.log('✅ Datos del dashboard obtenidos exitosamente:', data);

    return {
      stats: data.stats || [],
      coursesInProgress: data.coursesInProgress || [],
      availableCourses: data.availableCourses || [],
      activity: data.activity || [],
      news: data.news || [],
      user: data.user || null,
      summary: data.summary || null
    };

  } catch (error) {
    console.error('❌ Error al obtener datos del dashboard:', error);
    
    // Si es un error de autenticación, limpiar localStorage y redirigir
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    throw error;
  }
};



// 📊 Obtener perfil del usuario
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await api.get(ENDPOINTS.profile);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
};

// ⚙️ Actualizar configuraciones del usuario
export const updateUserSettings = async (settings) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await api.put(ENDPOINTS.settings, settings);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
};

export default getDashboardOverview;
