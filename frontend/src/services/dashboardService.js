import api from '../lib/api';

const mockDashboardData = {
  user: {
    name: 'Mario',
    role: 'Estudiante destacado',
  },
  stats: [
    {
      id: 'progress',
      title: 'Progreso promedio',
      value: '72%',
      caption: '+5% vs. el mes anterior',
      tone: 'blue',
    },
    {
      id: 'courses',
      title: 'Cursos activos',
      value: '4',
      caption: '2 nuevos esta semana',
      tone: 'violet',
    },
    {
      id: 'achievements',
      title: 'Logros desbloqueados',
      value: '12',
      caption: 'Último: Mentor de IA',
      tone: 'emerald',
    },
    {
      id: 'hours',
      title: 'Horas de estudio',
      value: '118 h',
      caption: 'Objetivo mensual: 150 h',
      tone: 'amber',
    },
  ],
  courses: [
    {
      id: 'course-1',
      title: 'Introducción a la Inteligencia Artificial',
      instructor: 'Laura Sánchez',
      progress: 65,
      lessonsCompleted: 13,
      lessonsTotal: 20,
      nextLesson: 'Redes Neuronales',
      category: 'Tecnología',
      cover:
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'course-2',
      title: 'Diseño UX/UI para Productos Digitales',
      instructor: 'Marco Rivas',
      progress: 40,
      lessonsCompleted: 8,
      lessonsTotal: 20,
      nextLesson: 'Patrones de Navegación',
      category: 'Diseño',
      cover:
        'https://images.unsplash.com/photo-1522199996199-8835e720d05a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'course-3',
      title: 'Bases de Datos con PostgreSQL',
      instructor: 'Claudia Ortega',
      progress: 82,
      lessonsCompleted: 18,
      lessonsTotal: 22,
      nextLesson: 'Optimización de Consultas',
      category: 'Datos',
      cover:
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    },
  ],
  activity: [
    {
      id: 'activity-1',
      title: 'Completaste el módulo 2 de IA',
      description: 'Aprendiste sobre algoritmos supervisados',
      date: '14 oct 2025',
      type: 'achievement',
    },
    {
      id: 'activity-2',
      title: 'Nueva inscripción: Diseño UX/UI',
      description: '¡Bienvenido al curso! Revisa los recursos iniciales',
      date: '12 oct 2025',
      type: 'enrollment',
    },
    {
      id: 'activity-3',
      title: 'Recibiste feedback en Evaluación 1',
      description: 'Tu mentor dejó comentarios detallados',
      date: '09 oct 2025',
      type: 'feedback',
    },
    {
      id: 'activity-4',
      title: 'Participaste en la sesión en vivo de IA',
      description: 'Sesión con expertos invitados',
      date: '05 oct 2025',
      type: 'live',
    },
  ],
};

const shouldFallbackToMock = (error) => {
  if (!error) return false;
  const message = (error.message || '').toLowerCase();
  const isOffline = typeof navigator !== 'undefined' && navigator?.onLine === false;
  return isOffline || message.includes('404') || message.includes('network') || message.includes('timeout');
};

export const getDashboardOverview = async () => {
  try {
    const [statsRes, coursesRes, activityRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/courses', { params: { status: 'in_progress' } }),
      api.get('/dashboard/activity', { params: { limit: 8 } }),
    ]);

    const payload = {
      user: statsRes?.data?.user ?? mockDashboardData.user,
      stats: statsRes?.data?.stats ?? mockDashboardData.stats,
      courses:
        coursesRes?.data?.courses ||
        coursesRes?.data?.items ||
        coursesRes?.data ||
        mockDashboardData.courses,
      activity:
        activityRes?.data?.activity ||
        activityRes?.data?.items ||
        activityRes?.data ||
        mockDashboardData.activity,
      isMock: false,
    };

    return payload;
  } catch (error) {
    if (shouldFallbackToMock(error)) {
      return { ...mockDashboardData, isMock: true };
    }

    throw error;
  }
};

export default getDashboardOverview;
