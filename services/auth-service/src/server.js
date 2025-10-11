import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import authRoutes from "./routes/auth.routes.js"; // 🔹 Importa tus rutas

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 Conexión a PostgreSQL (Neon)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL conectado con éxito"))
  .catch((err) => console.error("❌ Error conectando a PostgreSQL:", err));

// 🔧 Inicializa la base de datos (opcional)
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        lastname VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabla 'users' verificada/creada con éxito");
  } catch (err) {
    console.error("❌ Error inicializando la base de datos:", err);
  }
};
initDatabase();

// 🔹 Monta las rutas del módulo de autenticación
app.use("/api/auth", authRoutes);

// 🔹 Ruta de prueba base
app.get("/", (req, res) => {
  res.json({ mensaje: "Servidor funcionando 🚀" });
});

// 🔹 Ruta 404 para depurar errores
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada", path: req.originalUrl });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));

export default app;
