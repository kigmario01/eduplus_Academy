import dotenv from 'dotenv';
dotenv.config();

import pool from './config/db.js';
import app from './app.js';
const PORT = process.env.PORT || 4000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    console.log('🔄 Iniciando Auth Service...');
    console.log('🔍 Verificando conexión a PostgreSQL...');
    await pool.query('SELECT 1');

    // Escuchar en todas las interfaces (clave para Docker)
    app.listen(PORT, '0.0.0.0', () => {
      console.log('✅ Auth Service iniciado exitosamente');
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📊 Base de datos: PostgreSQL (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432})`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`📈 Database status: http://0.0.0.0:${PORT}/api/database/status`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error('💡 Asegúrate de que PostgreSQL esté ejecutándose y accesible');
    console.error('💡 Verifica las variables de entorno de conexión a la base de datos');
    process.exit(1);
  }
};

// Cierre controlado del servidor
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando Auth Service...');
  try {
    await pool.end();
    console.log('✅ Conexiones de base de datos cerradas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Cerrando Auth Service...');
  try {
    await pool.end();
    console.log('✅ Conexiones de base de datos cerradas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error);
    process.exit(1);
  }
});

startServer();
