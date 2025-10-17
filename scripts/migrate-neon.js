#!/usr/bin/env node

/**
 * Script de migración para base de datos Neon
 * Ejecuta las migraciones necesarias para course-service
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Función para ejecutar SQL desde archivo
async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Ejecutando: ${path.basename(filePath)}`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Dividir el SQL en statements individuales
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log(`✅ Completado: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error en ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

// Función para verificar si una tabla existe
async function tableExists(tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error verificando tabla ${tableName}:`, error.message);
    return false;
  }
}

// Función principal de migración
async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones para Neon Database...\n');
    
    // Verificar conexión
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a base de datos establecida\n');
    
    // Verificar si ya existen las tablas principales
    const coursesExists = await tableExists('courses');
    const categoriesExists = await tableExists('course_categories');
    
    if (coursesExists && categoriesExists) {
      console.log('⚠️  Las tablas principales ya existen. ¿Desea continuar? (y/N)');
      
      // En un entorno automatizado, puedes cambiar esto
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Migración cancelada por el usuario');
        return;
      }
    }
    
    // Ejecutar script de migración
    const migrationFile = path.join(__dirname, '..', 'database', 'neon-migration-course-service.sql');
    
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Archivo de migración no encontrado: ${migrationFile}`);
    }
    
    await executeSQLFile(migrationFile);
    
    console.log('\n🎉 ¡Migraciones completadas exitosamente!');
    console.log('\n📋 Tablas creadas/actualizadas:');
    console.log('   - course_categories');
    console.log('   - courses');
    console.log('   - course_sections');
    console.log('   - course_lessons');
    console.log('   - course_enrollments');
    console.log('   - lesson_progress');
    console.log('   - course_reviews');
    console.log('   - conversations');
    console.log('   - conversation_participants');
    console.log('   - messages');
    console.log('   - notifications');
    console.log('\n✨ Base de datos lista para course-service');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Función para verificar variables de entorno
function checkEnvironment() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL no está configurada');
    console.log('\n💡 Configura la variable de entorno:');
    console.log('   export DATABASE_URL="postgresql://user:password@host:port/database"');
    process.exit(1);
  }
  
  console.log('✅ Variables de entorno verificadas');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  checkEnvironment();
  runMigrations().catch(console.error);
}

module.exports = { runMigrations, executeSQLFile, tableExists };