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
  const shouldUseSSL = /sslmode=require/i.test(connectionString);
  client = new Pool({
    connectionString,
    ssl: shouldUseSSL ? { require: true, rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  client.on('connect', () => {
    dbAvailable = true;
    console.log('✅ Conectado correctamente a PostgreSQL');
  });
  client.on('error', (err) => console.error('❌ Error en la conexión con PostgreSQL', err));
}

export default client;
export { dbAvailable };