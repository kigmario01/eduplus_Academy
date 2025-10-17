-- Tabla de usuarios para EduPlus Academy
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'es',
    role VARCHAR(20) CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')) DEFAULT 'pending_verification',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    last_activity_at TIMESTAMP,
    profile_completed BOOLEAN DEFAULT FALSE,
    bio TEXT,
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    github_url VARCHAR(500),
    
    -- Campos específicos para instructores
    instructor_approved BOOLEAN DEFAULT FALSE,
    instructor_approved_at TIMESTAMP,
    instructor_bio TEXT,
    instructor_experience_years INTEGER,
    instructor_specialties TEXT[], -- Array de especialidades
    instructor_rating DECIMAL(3,2) DEFAULT 0.00,
    instructor_total_students INTEGER DEFAULT 0,
    instructor_total_courses INTEGER DEFAULT 0,
    instructor_total_reviews INTEGER DEFAULT 0,
    
    -- Campos de gamificación para estudiantes
    student_points INTEGER DEFAULT 0,
    student_level INTEGER DEFAULT 1,
    student_badges TEXT[], -- Array de badges obtenidos
    student_streak_days INTEGER DEFAULT 0,
    student_last_activity DATE,
    
    -- Configuraciones de notificaciones
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_push BOOLEAN DEFAULT TRUE,
    notifications_marketing BOOLEAN DEFAULT FALSE,
    
    -- Configuraciones de privacidad
    profile_public BOOLEAN DEFAULT TRUE,
    show_progress BOOLEAN DEFAULT TRUE,
    show_certificates BOOLEAN DEFAULT TRUE,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Para soft delete
);

-- Tabla de inscripciones a cursos
CREATE TABLE IF NOT EXISTS course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'dropped', 'paused')) DEFAULT 'active',
    last_accessed_at TIMESTAMP,
    total_time_spent INTEGER DEFAULT 0, -- en minutos
    certificate_issued BOOLEAN DEFAULT FALSE,
    final_grade DECIMAL(5,2),
    payment_status VARCHAR(20) CHECK (payment_status IN ('free', 'paid', 'pending', 'refunded')) DEFAULT 'free',
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_date TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0, -- en minutos
    last_position INTEGER DEFAULT 0, -- para videos, posición en segundos
    notes TEXT, -- notas del estudiante
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Tabla de intentos de quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES course_quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    score DECIMAL(5,2),
    passed BOOLEAN DEFAULT FALSE,
    answers JSONB, -- Respuestas del usuario en formato JSON
    time_taken INTEGER, -- en minutos
    UNIQUE(user_id, quiz_id, attempt_number)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en lesson_progress
CREATE TRIGGER update_lesson_progress_updated_at 
    BEFORE UPDATE ON lesson_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();