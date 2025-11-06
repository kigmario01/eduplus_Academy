import express from 'express';
import { feedbackController } from '../controllers/feedbackController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Listar feedback público
router.get('/', feedbackController.list);

// Crear nuevo feedback (solo usuarios autenticados)
router.post('/', authenticateToken, feedbackController.create);

export default router;