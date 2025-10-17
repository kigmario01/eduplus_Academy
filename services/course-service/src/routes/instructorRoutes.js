import express from 'express';
import { instructorController } from '../controllers/instructorController.js';

const router = express.Router();

// Rutas para instructores (se implementará autenticación después)
router.get('/dashboard', instructorController.getDashboard);
router.get('/courses', instructorController.getInstructorCourses);
router.get('/analytics', instructorController.getAnalytics);
router.get('/students', instructorController.getStudents);

export default router;