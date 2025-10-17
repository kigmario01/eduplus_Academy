import pkg from 'pg';
const { Pool } = pkg;

console.log('🔧 Configuración de conexión a PostgreSQL (Auth-Service)...');

// Usar la URL completa de conexión
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ No se encontró DATABASE_URL en las variables de entorno.');
  process.exit(1);
}

// Crear el pool con la conexión a Neon
const pool = new Pool({
  connectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false, // obligatorio en Render + Neon
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Eventos de conexión
pool.on('connect', () => console.log('✅ PostgreSQL conectado correctamente'));
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// -----------------------------
// Función de migraciones
// -----------------------------
export const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Ejecutando migraciones...');

    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        bio TEXT,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabla users lista');

  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    throw error;
  } finally {
    client.release();
  }
};

// -----------------------------
// Función de prueba de conexión
// -----------------------------
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
    throw error;
  }
};

export default pool;
