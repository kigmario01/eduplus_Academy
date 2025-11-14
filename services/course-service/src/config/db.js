import pkg from 'pg';
const { Pool } = pkg;

console.log("🔍 Configuración de conexión a PostgreSQL...");

const connectionString = process.env.DATABASE_URL;

let client;
let dbAvailable = false;

if (!connectionString) {
  console.warn("⚠️ No se encontró DATABASE_URL en las variables de entorno. El servicio se iniciará en modo 'sin DB'.");
  // Cliente simulado que arroja error al intentar consultar
  client = {
    query: async () => {
      throw new Error('Database not configured (DATABASE_URL ausente)');
    }
  };
} else {
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  const sslConfig = isLocal ? false : { require: true, rejectUnauthorized: false };

  client = new Pool({
    connectionString,
    ssl: sslConfig,
    connectionTimeoutMillis: 10000, // evita bloqueos por latencia
    idleTimeoutMillis: 30000,       // cierra conexiones inactivas
  });

  client.on('connect', () => {
    dbAvailable = true;
    console.log('✅ Conectado correctamente a PostgreSQL');
  });
  client.on('error', (err) => console.error('❌ Error en la conexión con PostgreSQL', err));
}

export default client;
export { dbAvailable };