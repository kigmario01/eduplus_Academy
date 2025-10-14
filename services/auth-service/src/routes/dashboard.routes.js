import express from "express";
import { getDashboardData, getUserProfile, updateUserSettings, getActiveCourses } from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Ruta para obtener datos del dashboard
router.get("/overview", getDashboardData);

// Rutas para el perfil del usuario
router.get("/profile", getUserProfile);

// Rutas para configuraciones
router.put("/settings", updateUserSettings);

// Ruta para obtener cursos activos
router.get("/courses", getActiveCourses);

export default router;