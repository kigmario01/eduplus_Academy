import express from 'express';
import {
  getAllCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  restoreCourse,
  getCourseStats
} from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Aplicar middleware de autenticación y autorización admin a todas las rutas
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Rutas de gestión de cursos
router.get('/courses', getAllCoursesAdmin);
router.get('/courses/stats', getCourseStats);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.patch('/courses/:id/restore', restoreCourse);

export default router;