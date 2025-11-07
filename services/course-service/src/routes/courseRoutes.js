import express from 'express';
import { courseController } from '../controllers/courseController.js';
import { upload } from '../middleware/upload.js';
import { requireCsrf } from '../middleware/csrf.js';
import sharp from 'sharp';

const router = express.Router();

// Rutas públicas
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseByIdOrSlug);

// Rutas protegidas (requieren autenticación)
// TODO: Agregar middleware de autenticación
router.post('/', requireCsrf, courseController.createCourse);
router.put('/:id', requireCsrf, courseController.updateCourse);
router.delete('/:id', requireCsrf, courseController.deleteCourse);
router.patch('/:id/status', requireCsrf, courseController.toggleCourseStatus);

export default router;
// Upload routes
router.post('/upload/thumbnail', requireCsrf, upload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
    }
    // Validar tipo y tamaño
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Formato de imagen inválido. Usa JPG, PNG o WebP.' });
    }
    if (req.file.size > 2 * 1024 * 1024) { // 2MB
      return res.status(400).json({ success: false, message: 'La imagen supera el tamaño máximo de 2MB.' });
    }

    // Optimizar y convertir a WebP (1200x675, cover)
    const inputPath = req.file.path;
    const optimizedName = req.file.filename.replace(/\.[^.]+$/, '') + '.webp';
    const pathParts = inputPath.split(/\\|\//);
    pathParts[pathParts.length - 1] = optimizedName;
    const outputPath = pathParts.join('/');

    await sharp(inputPath)
      .resize(1200, 675, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/thumbnails/${optimizedName}`;
    return res.json({ success: true, url: fileUrl, filename: optimizedName });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return res.status(500).json({ success: false, message: 'Error al subir la imagen' });
  }
});