import express from "express";
import cors from "cors";
import { pool, runMigrations } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// CORS, middlewares, etc.
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/users", userRoutes);

// health
app.get("/health", (_, res) => res.json({ ok: true }));

// 🔹 Ruta de prueba base
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor funcionando 🚀" });
});

// 🔹 Ruta de prueba para verificar conectividad
app.get("/api/test", (req, res) => {
  res.json({ 
    mensaje: "API funcionando correctamente", 
    timestamp: new Date().toISOString(),
    rutas_disponibles: ["/api/auth/register", "/api/auth/login"]
  });
});

// 🔹 Ruta 404 para depurar errores
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada", path: req.originalUrl });
});

// Conexión y migrations
pool.connect()
  .then(async () => {
    console.log("✅ PostgreSQL conectado");
    await runMigrations();
    console.log("✅ Tabla 'users' lista");
  })
  .catch(err => console.error("❌ Error de BD:", err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor escuchando en ${PORT}`);
});

export default app;
