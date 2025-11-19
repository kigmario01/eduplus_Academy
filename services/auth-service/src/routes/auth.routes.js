import express from "express";
import { register, login, getUsers, googleLogin, validateToken, logout, forgotPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/users", getUsers);
router.get("/validate", validateToken);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);

export default router;