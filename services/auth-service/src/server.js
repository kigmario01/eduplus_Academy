import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

// CORS con origen controlado por env (Vercel/Prod)
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Conectar DB una sola vez
connectDB();

app.use("/auth", authRoutes);

// Healthcheck
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.get("/", (_, res) => res.send("Auth Service funcionando 🚀"));
const PORT = process.env.PORT || 4000;

// Iniciar servidor en entornos no-serverless (Docker, local, Render)
// La condición original (!process.env.VERCEL) estaba causando problemas en Render
if (process.env.RENDER || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`✅ Servidor Auth en puerto ${PORT}`));
}

export default app;