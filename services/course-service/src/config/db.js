import pkg from 'pg';
const { Pool } = pkg;

console.log("🔍 Iniciando configuración de base de datos...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL presente:", !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // requerido por Neon y Render
  },
});

pool.on('connect', () => {
  console.log('✅ Conectado correctamente a PostgreSQL (Neon)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL', err);
  process.exit(-1);
});

export default pool;