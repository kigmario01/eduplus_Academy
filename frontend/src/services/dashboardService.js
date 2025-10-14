import api from '../lib/api';
import mockDashboardData from '../mocks/mockDashboardData';

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
        hoursStudied: summaryData.hoursStudied ?? mockDashboardData.summary.hoursStudied,
        completedCourses: summaryData.completedCourses ?? mockDashboardData.summary.completedCourses,
        certificates: summaryData.certificates ?? mockDashboardData.summary.certificates,
        points: summaryData.points ?? mockDashboardData.summary.points,
      },
      courses: coursesData,
      activities: activitiesData,
      user: summaryData.user || mockDashboardData.user,
      error: null,
      isMock: false,
    };
  } catch (error) {
    console.error('Error fetching dashboard data', error);
    return {
      summary: mockDashboardData.summary,
      courses: mockDashboardData.courses,
      activities: mockDashboardData.activities,
      user: mockDashboardData.user,
      error: error.message || 'No se pudieron cargar los datos',
      isMock: true,
    };
  }
}

export default {
  fetchDashboardOverview,
};
