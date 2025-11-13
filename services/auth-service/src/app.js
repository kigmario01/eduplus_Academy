import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

// Crear y configurar la app de Express
const app = express();

// Middleware
const defaultAllowedOrigins = [
  'https://eduplus-academy-ty5x.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));
const allowedMethods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'];
const allowedHeaders = ['Content-Type', 'Authorization', 'X-CSRF-Token'];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return allowedOrigins.some((allowedOrigin) => {
    if (!allowedOrigin) return false;
    return origin === allowedOrigin || origin.startsWith(`${allowedOrigin}/`);
  });
};

const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: allowedMethods,
  allowedHeaders,
  credentials: true,
  optionsSuccessStatus: 204
};

// Asegura que las cabeceras CORS estén presentes incluso si ocurre un error
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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// eliminar middleware duplicado
app.use(express.json());

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
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

// Endpoint para verificar estadísticas básicas de la base de datos
app.get('/api/database/status', async (req, res) => {
  try {
    await pool.query('SELECT 1');
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

export default app;