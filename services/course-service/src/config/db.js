import pkg from 'pg';
const { Pool } = pkg;

console.log("🔍 Configuración de conexión a PostgreSQL...");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ No se encontró DATABASE_URL en las variables de entorno");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false, // obligatorio en Neon y Render
  },
  connectionTimeoutMillis: 10000, // evita bloqueos por latencia
  idleTimeoutMillis: 30000,       // cierra conexiones inactivas
});

pool.on('connect', () => console.log('✅ Conectado correctamente a PostgreSQL'));
pool.on('error', (err) => console.error('❌ Error en la conexión con PostgreSQL', err));

export default pool;