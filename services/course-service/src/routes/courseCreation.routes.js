import express from 'express';
import { courseCreationController } from '../controllers/courseCreationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear curso completo
router.post('/courses/create', courseCreationController.createCourse);

// Agregar secciones a un curso
router.post('/courses/:courseId/sections', courseCreationController.addSection);

// Agregar lecciones a una sección
router.post('/sections/:sectionId/lessons', courseCreationController.addLesson);

// Crear examen para un curso
router.post('/courses/:courseId/exams', courseCreationController.createExam);

// Crear certificación para un curso
router.post('/courses/:courseId/certifications', courseCreationController.createCertification);

export default router;