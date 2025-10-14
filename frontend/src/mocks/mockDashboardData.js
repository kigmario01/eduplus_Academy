// Mock data for dashboard when API is not available
const mockDashboardData = {
  user: { 
    name: 'Estudiante Local', 
    role: 'student',
    email: 'estudiante@eduplus.com'
  },
  summary: {
    hoursStudied: 12,
    completedCourses: 2,
    certificates: 1,
    points: 150,
  },
  courses: [
    {
      id: 1,
      title: 'Introducción a JavaScript',
      instructor: 'Prof. García',
      category: 'Programación',
      completedLessons: 8,
      totalLessons: 12,
      image: null
    },
    {
      id: 2,
      title: 'Diseño Web Responsivo',
      instructor: 'Prof. Martínez',
      category: 'Diseño',
      completedLessons: 5,
      totalLessons: 10,
      image: null
    }
  ],
  activities: [
    {
      id: 1,
      type: 'lesson_completed',
      title: 'Completaste: Variables en JavaScript',
      timestamp: new Date().toISOString(),
      course: 'Introducción a JavaScript'
    },
    {
      id: 2,
      type: 'quiz_passed',
      title: 'Aprobaste el quiz de CSS Grid',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      course: 'Diseño Web Responsivo'
    }
  ],
};

export default mockDashboardData;