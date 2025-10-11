import express from "express"; 
import cors from "cors"; 
import dotenv from "dotenv"; 
import authRoutes from "./routes/auth.routes.js"; // Usando el nombre de archivo existente
import pkg from "pg"; 
const { Pool } = pkg; 

dotenv.config(); 

const app = express(); 
app.use(cors()); 
app.use(express.json()); 

// 🟢 Conexión a Neon PostgreSQL 
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false }, 
}); 

// 🔧 Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    // Crear tabla de usuarios si no existe
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

pool.connect() 
  .then(() => {
    console.log("✅ PostgreSQL conectado con éxito");
    // Inicializar la base de datos después de conectar
    initDatabase();
  })
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err)); 

// 👇 Prefijo para todas las rutas de autenticación 
app.use("/api", authRoutes); 

// Ruta raíz de prueba 
app.get("/", (req, res) => { 
  res.json({ message: "Servidor EduPlus corriendo correctamente 🚀" }); 
}); 

const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`)); 

export default app;