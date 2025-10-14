import api from './api';

const STAT_TONES = ['blue', 'violet', 'emerald', 'amber'];

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

const normalizeProgressCourse = (course = {}) => {
  const completed = Number(
    course.completedLessons ?? course.lessonsCompleted ?? course.progressLessons ?? course.completed ?? 0,
  );
  const total = Number(
    course.totalLessons ?? course.lessonsTotal ?? course.total ?? course.totalUnits ?? course.totalModules ?? 0,
  );
  const rawProgress = course.progress ?? course.progressPercentage ?? course.percentage ?? 0;
  let explicitProgress = Number(rawProgress);
  if (!Number.isFinite(explicitProgress) && typeof rawProgress === 'string') {
    const sanitized = Number(rawProgress.replace(/[^0-9.,-]/g, '').replace(',', '.'));
    explicitProgress = Number.isFinite(sanitized) ? sanitized : 0;
  }

  const progress = total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : explicitProgress;

  const resourceThumbnail = Array.isArray(course.resources) ? course.resources[0]?.thumbnail : undefined;

  return {
    id: course.id ?? course._id ?? course.slug ?? course.code ?? course.title,
    title: course.title ?? course.name ?? 'Curso sin título',
    instructor: course.instructor ?? course.teacher ?? course.mentor ?? course.author ?? null,
    progress: Number.isFinite(progress) ? progress : 0,
    lessonsCompleted: Number.isFinite(completed) ? completed : 0,
    lessonsTotal: Number.isFinite(total) ? total : 0,
    nextLesson:
      course.nextLesson?.title ??
      course.nextLesson ??
      course.upcomingLesson?.title ??
      course.upcoming?.title ??
      null,
    category: course.category ?? course.area ?? course.tag ?? 'General',
    cover:
      course.cover ??
      course.image ??
      course.thumbnail ??
      course.banner ??
      resourceThumbnail ??
      undefined,
  };
};

const normalizeAvailableCourse = (course = {}) => {
  const resourceThumbnail = Array.isArray(course.resources) ? course.resources[0]?.thumbnail : undefined;

  return {
    id: course.id ?? course._id ?? course.slug ?? course.code ?? course.title,
    title: course.title ?? course.name ?? 'Curso sin título',
    category: course.category ?? course.area ?? 'General',
    description: course.description ?? course.summary ?? '',
    level: course.level ?? course.difficulty ?? null,
    startDate: course.startDate ?? course.nextCohort ?? course.launchDate ?? null,
    duration: course.duration ?? course.estimatedTime ?? null,
    cover:
      course.cover ??
      course.image ??
      course.thumbnail ??
      course.banner ??
      resourceThumbnail ??
      undefined,
  };
};

const normalizeActivityItem = (item = {}) => ({
  id: item.id ?? item._id ?? item.reference ?? item.title,
  title: item.title ?? item.headline ?? item.event ?? 'Actividad registrada',
  description: item.description ?? item.detail ?? item.notes ?? '',
  date: toDateString(item.date ?? item.createdAt ?? item.timestamp ?? item.performedAt),
  type: item.type ?? item.kind ?? 'achievement',
});

const normalizeNewsItem = (item = {}) => ({
  id: item.id ?? item._id ?? item.slug ?? item.title,
  title: item.title ?? item.headline ?? 'Novedad',
  summary: item.summary ?? item.description ?? item.body ?? '',
  publishedAt: toDateString(item.publishedAt ?? item.date ?? item.createdAt),
  link: item.url ?? item.link ?? item.href ?? null,
  category: item.category ?? item.tag ?? 'Actualización',
});

export const getDashboardOverview = async () => {
  const [summary, coursesInProgress, availableCourses, activity, news, user] = await Promise.all([
    fetchFromCandidates(
      [
        { request: () => api.get('/dashboard/summary'), transform: (res) => res?.data?.summary ?? res?.data },
        { request: () => api.get('/dashboard/overview'), transform: (res) => res?.data?.summary },
        { request: () => api.get('/users/me/summary'), transform: (res) => res?.data },
        { request: () => api.get('/users/me/dashboard'), transform: (res) => res?.data?.summary },
      ],
      { errorMessage: 'No se pudo recuperar el resumen de tu actividad.' },
    ),
    fetchFromCandidates(
      [
        {
          request: () => api.get('/dashboard/courses', { params: { scope: 'in_progress' } }),
          transform: (res) => res?.data?.courses ?? res?.data?.items ?? res?.data,
        },
        {
          request: () => api.get('/users/me/courses', { params: { status: 'in_progress' } }),
          transform: (res) => res?.data?.courses ?? res?.data?.items ?? res?.data,
        },
        {
          request: () => api.get('/courses', { params: { enrollment: 'mine', status: 'in_progress' } }),
          transform: (res) => res?.data?.courses ?? res?.data?.items ?? res?.data,
        },
      ],
      { optional: true, defaultValue: [] },
    ),
    fetchFromCandidates(
      [
        {
          request: () => api.get('/dashboard/courses', { params: { scope: 'available' } }),
          transform: (res) => res?.data?.available ?? res?.data?.courses ?? res?.data?.items ?? res?.data,
        },
        {
          request: () => api.get('/courses/available'),
          transform: (res) => res?.data?.courses ?? res?.data?.items ?? res?.data,
        },
        {
          request: () => api.get('/courses', { params: { status: 'available' } }),
          transform: (res) => res?.data?.courses ?? res?.data?.items ?? res?.data,
        },
      ],
      { optional: true, defaultValue: [] },
    ),
    fetchFromCandidates(
      [
        {
          request: () => api.get('/dashboard/activity', { params: { limit: 8 } }),
          transform: (res) => res?.data?.activity ?? res?.data?.items ?? res?.data,
        },
        {
          request: () => api.get('/users/me/activities', { params: { limit: 8 } }),
          transform: (res) => res?.data?.activity ?? res?.data?.items ?? res?.data,
        },
      ],
      { optional: true, defaultValue: [] },
    ),
    fetchFromCandidates(
      [
        {
          request: () => api.get('/dashboard/news', { params: { limit: 5 } }),
          transform: (res) => res?.data?.news ?? res?.data?.items ?? res?.data,
        },
        {
          request: () => api.get('/news', { params: { limit: 5, scope: 'eduplus' } }),
          transform: (res) => res?.data?.news ?? res?.data?.items ?? res?.data,
        },
        {
          request: () => api.get('/announcements', { params: { limit: 5 } }),
          transform: (res) => res?.data?.announcements ?? res?.data?.items ?? res?.data,
        },
      ],
      { optional: true, defaultValue: [] },
    ),
    fetchFromCandidates(
      [
        { request: () => api.get('/users/me'), transform: (res) => res?.data },
        { request: () => api.get('/profile/me'), transform: (res) => res?.data },
        { request: () => api.get('/dashboard/summary'), transform: (res) => res?.data?.user },
      ],
      { optional: true, defaultValue: null },
    ),
  ]);

  return {
    user: user ?? summary?.user ?? null,
    stats: mapSummaryToStats(summary),
    summary,
    coursesInProgress: Array.isArray(coursesInProgress)
      ? coursesInProgress.map(normalizeProgressCourse)
      : [],
    availableCourses: Array.isArray(availableCourses)
      ? availableCourses.map(normalizeAvailableCourse)
      : [],
    activity: Array.isArray(activity) ? activity.map(normalizeActivityItem) : [],
    news: Array.isArray(news) ? news.map(normalizeNewsItem) : [],
  };
};

export default getDashboardOverview;
