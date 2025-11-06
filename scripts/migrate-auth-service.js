#!/usr/bin/env node

/**
 * Script de migración para base de datos Neon (auth-service)
 * Ejecuta la migración que añade campos de OAuth a la tabla users
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Ejecutando: ${path.basename(filePath)}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log(`✅ Completado: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error en ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

async function checkEnvironment() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL no está configurada');
    console.log('\n💡 Configura la variable y reintenta:');
    console.log('   $env:DATABASE_URL="postgresql://user:password@host:port/database"');
    console.log('   node scripts/migrate-auth-service.js');
    process.exit(1);
  }
  console.log('✅ Variables de entorno verificadas');
}

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migración de auth-service (OAuth en users) ...\n');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a base de datos establecida\n');

    const migrationFile = path.join(__dirname, '..', 'database', 'neon-migration-auth-service.sql');
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Archivo de migración no encontrado: ${migrationFile}`);
    }

    await executeSQLFile(migrationFile);

    console.log('\n🎉 ¡Migración de auth-service completada!');
    console.log('📋 Cambios: columnas provider, provider_id e índices en users');
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  checkEnvironment();
  runMigrations().catch(console.error);
}

module.exports = { runMigrations, executeSQLFile };