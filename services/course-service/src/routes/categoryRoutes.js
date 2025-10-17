import express from 'express';
import { categoryController } from '../controllers/categoryController.js';

const router = express.Router();

// Rutas públicas para categorías
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/courses', categoryController.getCategoryCourses);

// Rutas protegidas para administradores (se implementará autenticación después)
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;