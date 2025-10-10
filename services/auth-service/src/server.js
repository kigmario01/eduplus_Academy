import express from "express"; 
import pkg from "pg"; 
const { Pool } = pkg; 
import cors from "cors"; 
import bcrypt from "bcryptjs";
 
const app = express(); 
app.use(cors()); 
app.use(express.json()); 
 
// 🟢 Conexión a Neon PostgreSQL 
const pool = new Pool({ 
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
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
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

// 🔐 Ruta de registro con depuración
app.post("/auth/register", async (req, res) => { 
  try { 
    console.log("📩 Registro recibido:", req.body); 

    const { name, email, password } = req.body; 

    if (!name || !email || !password) { 
      console.log("❌ Campos faltantes:", req.body); 
      return res.status(400).json({ error: "Faltan campos en el formulario" }); 
    } 

    const existingUser = await pool.query( 
      "SELECT * FROM users WHERE email = $1", 
      [email] 
    ); 

    if (existingUser.rows.length > 0) { 
      console.log("⚠️ Usuario ya existe:", email); 
      return res.status(409).json({ error: "El usuario ya existe" }); 
    } 

    const hashedPassword = await bcrypt.hash(password, 10); 

    const result = await pool.query( 
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email", 
      [name, email, hashedPassword] 
    ); 

    console.log("✅ Usuario creado:", result.rows[0]); 

    res.status(201).json({ 
      message: "Usuario registrado exitosamente", 
      user: result.rows[0], 
    }); 

  } catch (err) { 
    console.error("🔥 ERROR DETECTADO EN REGISTRO:", err); 
    // Mostrar el mensaje real del error 
    res.status(500).json({ 
      error: "Error interno del servidor", 
      detail: err.message || "Error desconocido", 
    }); 
  } 
}); 
 
// 🧱 Puerto 
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => { 
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`); 
});
export default app;