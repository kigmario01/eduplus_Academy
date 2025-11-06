import express from "express";
import { register, login, getUsers, googleLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/users", getUsers);

export default router;