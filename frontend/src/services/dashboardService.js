import { userApi as api } from '@/lib/api';

export async function fetchDashboardOverview() {
  try {
    const [summaryRes, coursesRes, activitiesRes] = await Promise.all([
      api.get('/users/me/summary'),
      api.get('/users/me/courses', { params: { status: 'in_progress' } }),
      api.get('/users/me/activities', { params: { limit: 10 } }),
    ]);

    const summaryData = summaryRes?.data || {};
    const coursesData = Array.isArray(coursesRes?.data?.items)
      ? coursesRes.data.items
      : coursesRes?.data || [];
    const activitiesData = Array.isArray(activitiesRes?.data?.items)
      ? activitiesRes.data.items
      : activitiesRes?.data || [];

    return {
      summary: {
        hoursStudied: summaryData.hoursStudied ?? null,
        completedCourses: summaryData.completedCourses ?? null,
        certificates: summaryData.certificates ?? null,
        points: summaryData.points ?? null,
      },
      courses: coursesData,
      activities: activitiesData,
      user: summaryData.user || null,
      error: null,
      hasData: !!(summaryData.hoursStudied || coursesData.length || activitiesData.length),
    };
  } catch (error) {
    console.error('Error fetching dashboard data', error);
    return {
      summary: {
        hoursStudied: null,
        completedCourses: null,
        certificates: null,
        points: null,
      },
      courses: [],
      activities: [],
      user: null,
      error: error.message || 'No se pudieron cargar los datos del servidor',
      hasData: false,
    };
  }
}

export default {
  fetchDashboardOverview,
};
