import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  getUserStats
} from '../controllers/admin.controller.js';
import { adminAuth, logAdminAction } from '../middleware/auth.middleware.js';

const router = express.Router();

// Aplicar middleware de autenticación admin a todas las rutas
router.use(adminAuth);

// Rutas de gestión de usuarios
router.get('/users', logAdminAction('GET_USERS'), getAllUsers);
router.get('/users/stats', logAdminAction('GET_USER_STATS'), getUserStats);
router.get('/users/:id', logAdminAction('GET_USER'), getUserById);
router.post('/users', logAdminAction('CREATE_USER'), createUser);
router.put('/users/:id', logAdminAction('UPDATE_USER'), updateUser);
router.delete('/users/:id', logAdminAction('DELETE_USER'), deleteUser);
router.patch('/users/:id/reactivate', logAdminAction('REACTIVATE_USER'), reactivateUser);

export default router;