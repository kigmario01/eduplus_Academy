import express from "express";
import { getUserSummary, getUserCourses, getUserActivities } from "../controllers/userController.js";

const router = express.Router();

// Rutas para el dashboard del usuario
router.get("/me/summary", getUserSummary);
router.get("/me/courses", getUserCourses);
router.get("/me/activities", getUserActivities);

export default router;