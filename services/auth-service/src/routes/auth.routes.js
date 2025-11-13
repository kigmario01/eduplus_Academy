import express from "express";
import cors from "cors";
import { register, login, getUsers, googleLogin } from "../controllers/auth.controller.js";

const router = express.Router();

// 🔥 Preflight CORS necesario para que Vercel pueda hacer POST desde frontend
router.options("/login", cors());
router.options("/register", cors());
router.options("/google", cors());
router.options("/users", cors()); // por si usas GET con headers personalizados

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/users", getUsers);

export default router;
