import express from 'express';
import { courseController } from '../controllers/courseController.js';
import { upload } from '../middleware/upload.js';

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
// Upload routes
router.post('/upload/thumbnail', upload.single('thumbnail'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/thumbnails/${req.file.filename}`;
    return res.json({ success: true, url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return res.status(500).json({ success: false, message: 'Error al subir la imagen' });
  }
});