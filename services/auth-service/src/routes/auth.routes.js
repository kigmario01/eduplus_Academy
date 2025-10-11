import express from "express";
import { registerUser } from "../controllers/authController.js";

const router = express.Router();

// Ruta que el frontend está llamando
router.post("/register", registerUser);
// Mantenemos la ruta de login por si se necesita
router.post("/login", (req, res) => {
  res.status(501).json({ message: "Funcionalidad de login en desarrollo" });
});

export default router;