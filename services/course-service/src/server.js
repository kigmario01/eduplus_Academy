import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import db from './config/db.js';
import courseRoutes from './routes/courseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import courseSectionRoutes from './routes/courseSectionRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// Forzar puerto estable para desarrollo local (evitar conflictos de env)
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sections', courseSectionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Course Service', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Start server
const startServer = async () => {
  let dbReady = false;
  try {
    // Intentar verificar conexión a la base de datos (si está disponible)
    await db.query('SELECT 1');
    dbReady = true;
    console.log('✅ Course Service connected to PostgreSQL database');
  } catch (error) {
    console.warn('⚠️ Course Service no pudo conectarse a la base de datos. Continuando en modo sin DB. Detalle:', error?.message || error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Course Service running on port ${PORT}`);
    console.log(`📚 Course API available at http://localhost:${PORT}/api/courses`);
    console.log(`📂 Categories API available at http://localhost:${PORT}/api/categories`);
    console.log(`👨‍🏫 Instructor API available at http://localhost:${PORT}/api/instructor`);
    console.log(`💬 Messages API available at http://localhost:${PORT}/api/messages`);
    console.log(`📑 Sections API available at http://localhost:${PORT}/api/sections`);
    console.log(`📝 Enrollments API available at http://localhost:${PORT}/api/enrollments`);
    console.log(`💬 Feedback API available at http://localhost:${PORT}/api/feedback`);
    if (!dbReady) {
      console.log('⚠️ Modo sin DB activo: las rutas que consultan la base de datos devolverán errores hasta configurar DATABASE_URL. La subida de imágenes funcionará.');
    }
  });
};

startServer();