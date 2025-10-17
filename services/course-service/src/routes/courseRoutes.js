import express from 'express';
import { courseController } from '../controllers/courseController.js';

const router = express.Router();

// Rutas públicas
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseByIdOrSlug);

// Rutas protegidas (requieren autenticación)
// TODO: Agregar middleware de autenticación
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.patch('/:id/status', courseController.toggleCourseStatus);

export default router;