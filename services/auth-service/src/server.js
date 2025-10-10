import express from "express"; 
import pkg from "pg"; 
const { Pool } = pkg; 
import cors from "cors"; 
 
const app = express(); 
app.use(cors()); 
app.use(express.json()); 
 
// 🟢 Conexión a Neon PostgreSQL 
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false }, 
}); 
 
pool.connect() 
  .then(() => console.log("✅ PostgreSQL conectado con éxito")) 
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err)); 
 
// 🧪 Ruta de prueba 
app.get("/", async (req, res) => { 
  try { 
    const result = await pool.query("SELECT NOW()"); 
    res.json({ mensaje: "Servidor funcionando 🎉", hora: result.rows[0] }); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: "Error en la base de datos" }); 
  } 
}); 
 
// 🧱 Puerto 
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`)); 
 
export default app;