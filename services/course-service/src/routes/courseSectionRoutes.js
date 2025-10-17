import express from 'express';
import { courseSectionController } from '../controllers/courseSectionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas para secciones
router.post('/courses/:courseId/sections', authenticateToken, courseSectionController.createSection);
router.get('/courses/:courseId/sections', courseSectionController.getCourseSections);
router.put('/sections/:sectionId', authenticateToken, courseSectionController.updateSection);
router.delete('/sections/:sectionId', authenticateToken, courseSectionController.deleteSection);

// Rutas para lecciones
router.post('/sections/:sectionId/lessons', authenticateToken, courseSectionController.createLesson);
router.get('/sections/:sectionId/lessons', courseSectionController.getSectionLessons);
router.put('/lessons/:lessonId', authenticateToken, courseSectionController.updateLesson);
router.delete('/lessons/:lessonId', authenticateToken, courseSectionController.deleteLesson);

export default router;