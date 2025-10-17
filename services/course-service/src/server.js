import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { db, runMigrations } from './config/db.js';
import courseRoutes from './routes/courseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import courseSectionRoutes from './routes/courseSectionRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sections', courseSectionRoutes);
app.use('/api/enrollments', enrollmentRoutes);

console.log('🔧 Loading admin routes...');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes loaded successfully');

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
  try {
    await runMigrations();
    console.log('✅ Course Service connected to PostgreSQL database');
    
    app.listen(PORT, () => {
      console.log(`🚀 Course Service running on port ${PORT}`);
      console.log(`📚 Course API available at http://localhost:${PORT}/api/courses`);
      console.log(`📂 Categories API available at http://localhost:${PORT}/api/categories`);
      console.log(`👨‍🏫 Instructor API available at http://localhost:${PORT}/api/instructor`);
      console.log(`💬 Messages API available at http://localhost:${PORT}/api/messages`);
      console.log(`📑 Sections API available at http://localhost:${PORT}/api/sections`);
      console.log(`📝 Enrollments API available at http://localhost:${PORT}/api/enrollments`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();