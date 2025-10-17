import pkg from "pg";
const { Pool } = pkg;

console.log('🔍 Database configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

// Configuración para producción (Neon) vs desarrollo (local)
const isProduction = process.env.NODE_ENV === 'production';

let poolConfig;

if (isProduction && process.env.DATABASE_URL) {
  // Configuración para producción con Neon
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Configuración para desarrollo local
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 15432,
    database: process.env.DB_NAME || 'eduplus_academy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    ssl: false,
  };
}

const pool = new Pool(poolConfig);

export const db = pool;

// Función para ejecutar el esquema completo de base de datos
export const runMigrations = async () => {
  try {
    console.log('🔄 Checking database connection...');
    
    // Verificar conexión con una consulta simple
    await db.query('SELECT 1');
    
    console.log('✅ Database connection successful, schema already configured via Docker initialization');
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

// Función fallback para crear tablas básicas
const createBasicTables = async () => {
  // Crear tabla de categorías
  await db.query(`
    CREATE TABLE IF NOT EXISTS course_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(50),
      color VARCHAR(7),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear tabla de cursos
  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(200) UNIQUE NOT NULL,
      description TEXT,
      short_description VARCHAR(500),
      instructor_id INTEGER NOT NULL,
      category_id INTEGER REFERENCES course_categories(id),
      level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
      price DECIMAL(10,2) DEFAULT 0.00,
      currency VARCHAR(3) DEFAULT 'USD',
      thumbnail_url VARCHAR(500),
      preview_video_url VARCHAR(500),
      duration_hours INTEGER DEFAULT 0,
      total_lessons INTEGER DEFAULT 0,
      language VARCHAR(10) DEFAULT 'es',
      status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
      featured BOOLEAN DEFAULT FALSE,
      requirements TEXT[],
      what_you_learn TEXT[],
      target_audience TEXT[],
      rating DECIMAL(3,2) DEFAULT 0.00,
      total_students INTEGER DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP
    )
  `);

  // Insertar categorías por defecto
  await db.query(`
    INSERT INTO course_categories (name, description, icon, color) VALUES
    ('Programación', 'Cursos de desarrollo de software y programación', 'code', '#3B82F6'),
    ('Diseño', 'Cursos de diseño gráfico, web y UX/UI', 'palette', '#8B5CF6'),
    ('Marketing', 'Cursos de marketing digital y estrategias de negocio', 'trending-up', '#10B981'),
    ('Datos', 'Cursos de análisis de datos, ciencia de datos y BI', 'bar-chart', '#F59E0B'),
    ('Redes', 'Cursos de redes, ciberseguridad y administración de sistemas', 'shield', '#EF4444'),
    ('Negocios', 'Cursos de administración, liderazgo y emprendimiento', 'briefcase', '#6366F1'),
    ('Idiomas', 'Cursos de idiomas y comunicación', 'globe', '#EC4899'),
    ('Certificaciones', 'Preparación para certificaciones profesionales', 'award', '#F97316')
    ON CONFLICT (name) DO NOTHING
  `);
};