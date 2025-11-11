import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_COURSE_SERVICE_URL || 'http://localhost:5003/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const courseCreationAPI = {
  // Crear curso completo
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/course-creation/courses/create', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener categorías
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agregar sección a un curso
  addSection: async (courseId, sectionData) => {
    try {
      const response = await api.post(`/course-creation/courses/${courseId}/sections`, sectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agregar lección a una sección
  addLesson: async (sectionId, lessonData) => {
    try {
      const response = await api.post(`/course-creation/sections/${sectionId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear examen para un curso
  createExam: async (courseId, examData) => {
    try {
      const response = await api.post(`/course-creation/courses/${courseId}/exams`, examData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear certificación para un curso
  createCertification: async (courseId, certificationData) => {
    try {
      const response = await api.post(`/course-creation/courses/${courseId}/certifications`, certificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default courseCreationAPI;