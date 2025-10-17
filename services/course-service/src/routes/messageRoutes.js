import express from 'express';
import { messageController } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas de conversaciones
router.post('/conversations', messageController.createConversation);
router.get('/conversations', messageController.getUserConversations);
router.get('/conversations/:conversationId/participants', messageController.getConversationParticipants);

// Rutas de mensajes
router.get('/conversations/:conversationId/messages', messageController.getConversationMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);

export default router;