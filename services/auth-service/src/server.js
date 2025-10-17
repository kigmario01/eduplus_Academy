import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pool, { runMigrations, testConnection } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await testConnection();
    
    res.json({ 
      status: 'OK', 
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL',
        status: 'Connected',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'eduplus_academy'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL',
        status: 'Disconnected',
        error: error.message
      },
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Endpoint para verificar el estado de la base de datos
app.get('/api/database/status', async (req, res) => {
  try {
    await testConnection();
    
    // Obtener estadísticas básicas de la base de datos
    const client = await pool.connect();
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM course_enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM user_activities) as total_activities,
        (SELECT COUNT(*) FROM user_achievements) as total_achievements
    `);
    client.release();
    
    res.json({
      status: 'Connected',
      statistics: stats.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    console.log('🔄 Iniciando Auth Service...');
    
    // Verificar conexión a PostgreSQL
    console.log('🔍 Verificando conexión a PostgreSQL...');
    await testConnection();
    
    // Ejecutar migraciones
    console.log('🔄 Ejecutando migraciones de base de datos...');
    await runMigrations();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('✅ Auth Service iniciado exitosamente');
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📊 Base de datos: PostgreSQL (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432})`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Database status: http://localhost:${PORT}/api/database/status`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error('💡 Asegúrate de que PostgreSQL esté ejecutándose y accesible');
    console.error('💡 Verifica las variables de entorno de conexión a la base de datos');
    process.exit(1);
  }
};

// Manejar cierre graceful del servidor
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
