import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import db from './config/db.js';
import courseRoutes from './routes/courseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import courseSectionRoutes from './routes/courseSectionRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import courseCreationRoutes from './routes/courseCreation.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// Usa el puerto proporcionado por el entorno (p.ej., Render) o 5000 por defecto
const PORT = process.env.PORT || 5000;

// Middleware
const defaultAllowedOrigins = [
  'https://eduplus-academy-ty5x.vercel.app',
  'https://eduplus-academy.onrender.com',
  'https://eduplus-academy.vercel.app',
  'https://eduplus-academy-ty5x-git-main-eduplus-academy.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const envAllowedOrigins = [process.env.ALLOWED_ORIGINS, process.env.CORS_ORIGIN]
  .filter(Boolean)
  .flatMap((value) => value.split(','))
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));
const hasWildcardOrigin = allowedOrigins.includes('*');
const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const allowedHeaders = ['Content-Type', 'Authorization', 'X-CSRF-Token'];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (hasWildcardOrigin) return true;
  return allowedOrigins.includes(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: allowedMethods,
  allowedHeaders,
  credentials: true,
  optionsSuccessStatus: 204
};

const corsMiddleware = cors(corsOptions);
app.use(corsMiddleware);
app.options('*', corsMiddleware);

// Headers manuales para garantizar respuesta a los preflight
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', allowedMethods.join(','));
    res.header('Access-Control-Allow-Headers', allowedHeaders.join(','));
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  }
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static files for uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// CSRF token endpoint
import { issueCsrfToken } from './middleware/csrf.js';
app.get('/api/csrf-token', issueCsrfToken);

app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sections', courseSectionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/course-creation', courseCreationRoutes);

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
    // Ensure optional columns exist (idempotent)
    try {
      await db.query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[]');
    } catch (e) {
      console.warn('No se pudo asegurar columna opcional tags:', e?.message || e);
    }
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