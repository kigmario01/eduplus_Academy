#!/usr/bin/env node

/**
 * Script de prueba para validar conexión a Neon Database
 * Verifica que la configuración de producción funcione correctamente
 */

const { Pool } = require('pg');

// Función para probar la conexión
async function testNeonConnection() {
  console.log('🔍 Probando conexión a Neon Database...\n');
  
  // Verificar que DATABASE_URL esté configurada
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    console.log('\n💡 Para probar la conexión, configura:');
    console.log('   $env:DATABASE_URL="postgresql://user:password@host:port/database"');
    console.log('   node scripts/test-neon-connection.js');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // Test 1: Conexión básica
    console.log('📡 Test 1: Conexión básica...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Conexión exitosa');
    console.log(`   Tiempo: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}\n`);
    
    // Test 2: Verificar extensiones
    console.log('🔧 Test 2: Verificando extensiones...');
    const extensions = await pool.query(`
      SELECT extname FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pg_stat_statements')
    `);
    console.log('✅ Extensiones disponibles:', extensions.rows.map(r => r.extname).join(', ') || 'Ninguna');
    
    // Test 3: Verificar permisos de creación
    console.log('\n🔐 Test 3: Verificando permisos...');
    await pool.query('CREATE TABLE IF NOT EXISTS test_permissions (id SERIAL PRIMARY KEY, test_data TEXT)');
    await pool.query('INSERT INTO test_permissions (test_data) VALUES ($1)', ['test_connection']);
    const permissionTest = await pool.query('SELECT COUNT(*) as count FROM test_permissions');
    await pool.query('DROP TABLE test_permissions');
    console.log('✅ Permisos de escritura: OK');
    
    // Test 4: Verificar si las tablas del course-service existen
    console.log('\n📋 Test 4: Verificando tablas existentes...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('courses', 'course_categories', 'course_sections', 'course_lessons')
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Tablas encontradas:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas del course-service');
      console.log('   Ejecuta: npm run migrate:neon');
    }
    
    // Test 5: Performance básico
    console.log('\n⚡ Test 5: Performance básico...');
    const start = Date.now();
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    console.log(`✅ Latencia: ${latency}ms`);
    
    console.log('\n🎉 ¡Todos los tests pasaron exitosamente!');
    console.log('✨ La base de datos Neon está lista para course-service');
    
  } catch (error) {
    console.error('\n❌ Error en la conexión:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica que la URL de Neon sea correcta');
      console.log('   2. Asegúrate de tener conexión a internet');
    } else if (error.code === '28P01') {
      console.log('\n💡 Error de autenticación:');
      console.log('   1. Verifica usuario y contraseña en DATABASE_URL');
      console.log('   2. Asegúrate de que la base de datos esté activa');
    } else if (error.code === '3D000') {
      console.log('\n💡 Base de datos no encontrada:');
      console.log('   1. Verifica el nombre de la base de datos en la URL');
      console.log('   2. Asegúrate de que la base de datos exista en Neon');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Función para mostrar información de configuración
function showConfig() {
  console.log('⚙️  Configuración actual:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'no configurado'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ configurado' : '❌ no configurado'}`);
  console.log('');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  showConfig();
  testNeonConnection().catch(console.error);
}

module.exports = { testNeonConnection };