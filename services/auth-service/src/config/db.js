import pkg from 'pg';
const { Pool } = pkg;

// Debug: Mostrar configuración de la base de datos
console.log('🔧 Configuración de DB:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eduplus_academy',
  user: process.env.DB_USER || 'eduplus_user',
  password: process.env.DB_PASSWORD ? '***' : 'default'
});

// Configuración del pool de conexiones PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 15432,
  database: process.env.DB_NAME || 'eduplus_academy',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo de espera para obtener una conexión
});

// Función para ejecutar migraciones básicas
export const runMigrations = async () => {
  const client = await pool.connect();
  try {
    // Crear extensiones necesarias
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Crear tabla de usuarios con campos completos
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        bio TEXT,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de inscripciones a cursos
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
        grade DECIMAL(5,2),
        certificate_issued BOOLEAN DEFAULT false,
        certificate_url VARCHAR(500),
        last_accessed TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      )
    `);

    // Crear tabla de progreso de lecciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT false,
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
        time_spent INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        last_position INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id, lesson_id)
      )
    `);

    // Crear tabla de actividades de usuario
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        metadata JSONB,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de logros de usuario
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        points INTEGER DEFAULT 0,
        badge_color VARCHAR(20) DEFAULT 'blue',
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        is_featured BOOLEAN DEFAULT false
      )
    `);

    // Crear tabla de preferencias de usuario
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        language VARCHAR(10) DEFAULT 'es',
        timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
        theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
        notifications_email BOOLEAN DEFAULT true,
        notifications_push BOOLEAN DEFAULT true,
        auto_play_videos BOOLEAN DEFAULT true,
        playback_speed DECIMAL(3,2) DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de intentos de quiz
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL,
        quiz_id INTEGER NOT NULL,
        attempt_number INTEGER DEFAULT 1,
        score DECIMAL(5,2),
        max_score DECIMAL(5,2),
        percentage DECIMAL(5,2),
        passed BOOLEAN DEFAULT false,
        time_taken INTEGER,
        answers JSONB,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de certificados
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL,
        certificate_number VARCHAR(100) UNIQUE NOT NULL,
        certificate_url VARCHAR(500),
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_valid BOOLEAN DEFAULT true,
        verification_code VARCHAR(50) UNIQUE,
        metadata JSONB
      )
    `);

    // Crear índices para optimizar consultas
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activities_user_id ON user_activities(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id)');

    console.log('✅ Migraciones de auth-service completadas exitosamente');
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
    throw error;
  }
};

// Manejar eventos del pool
pool.on('connect', () => {
  console.log('🔗 Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

export default pool;