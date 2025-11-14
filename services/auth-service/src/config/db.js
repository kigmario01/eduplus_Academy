import pkg from 'pg';
const { Pool } = pkg;

console.log("🔧 Inicializando conexión a PostgreSQL (Auth-Service)...");

const conn = process.env.DATABASE_URL;
const isLocal = conn ? /localhost|127\.0\.0\.1/.test(conn) : false;
const sslConfig = isLocal ? false : { require: true, rejectUnauthorized: false };

const pool = new Pool({
  connectionString: conn,
  ssl: sslConfig,
  connectionTimeoutMillis: 10000, // Espera máxima para conexión
  idleTimeoutMillis: 10000,       // Cierra rápido conexiones inactivas
  max: 10                         // Evita exceso de conexiones simultáneas
});

// Evento de conexión
pool.on('connect', () => console.log('✅ PostgreSQL conectado'));
pool.on('error', (err) => {
  console.error('⚠️ Error inesperado en la conexión PostgreSQL:', err.message);
  if (err.code === 'ECONNRESET' || err.message.includes('Connection terminated unexpectedly')) {
    console.log('🔁 Intentando reconexión automática...');
  }
});

// Manejo global de errores no controlados
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
});

// Ping periódico para mantener conexión activa (desactivado en tests)
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      await pool.query('SELECT 1');
      console.log('🔄 Manteniendo conexión activa...');
    } catch (e) {
      console.error('⚠️ Ping DB falló:', e.message);
    }
  }, 4 * 60 * 1000); // cada 4 minutos
}

export default pool;
