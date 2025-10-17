import express from 'express';
import { enrollmentController } from '../controllers/enrollmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../config/db.js';

const router = express.Router();

// Ruta de prueba para obtener todas las inscripciones
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM course_enrollments LIMIT 10');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las inscripciones'
    });
  }
});

// Rutas para inscripciones
router.post('/enroll', authenticateToken, enrollmentController.enrollStudent);
router.get('/my-courses', authenticateToken, enrollmentController.getStudentEnrollments);
router.get('/users/:userId/enrollments', authenticateToken, enrollmentController.getStudentEnrollments);

// Rutas para progreso
router.get('/courses/:courseId/progress', authenticateToken, enrollmentController.getCourseProgress);
router.put('/lessons/:lessonId/progress', authenticateToken, enrollmentController.updateLessonProgress);

// Rutas para estadísticas de instructor
router.get('/instructor/stats', authenticateToken, enrollmentController.getInstructorEnrollmentStats);
router.get('/instructor/:instructorId/stats', authenticateToken, enrollmentController.getInstructorEnrollmentStats);

export default router;