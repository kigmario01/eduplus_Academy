-- =====================================================
-- EDUPLUS ACADEMY - AUTH SERVICE DATABASE SCHEMA
-- Script para crear todas las tablas del servicio de autenticación
-- Versión: 1.0
-- Fecha: 2024-10-16
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: users
-- Descripción: Almacena información de todos los usuarios del sistema
-- =====================================================
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
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- TABLA: course_enrollments
-- Descripción: Registra las inscripciones de estudiantes a cursos
-- =====================================================
CREATE TABLE IF NOT EXISTS course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL, -- Referencia al course-service
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
);

-- Índices para optimizar consultas
CREATE INDEX idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_enrollments_progress ON course_enrollments(progress);

-- =====================================================
-- TABLA: lesson_progress
-- Descripción: Rastrea el progreso de los estudiantes en lecciones específicas
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL, -- Referencia al course-service
    lesson_id INTEGER NOT NULL, -- Referencia al course-service
    completed BOOLEAN DEFAULT false,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- En minutos
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_position INTEGER DEFAULT 0, -- Para videos, posición en segundos
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, lesson_id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed);

-- =====================================================
-- TABLA: user_activities
-- Descripción: Registra todas las actividades de los usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    entity_type VARCHAR(50), -- 'course', 'lesson', 'quiz', 'assignment', etc.
    entity_id INTEGER,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_activities_type ON user_activities(activity_type);
CREATE INDEX idx_activities_entity ON user_activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON user_activities(created_at);
CREATE INDEX idx_activities_metadata ON user_activities USING GIN(metadata);

-- =====================================================
-- TABLA: user_achievements
-- Descripción: Almacena los logros obtenidos por los usuarios
-- =====================================================
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
);

-- Índices para optimizar consultas
CREATE INDEX idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_achievements_type ON user_achievements(achievement_type);
CREATE INDEX idx_achievements_earned_at ON user_achievements(earned_at);

-- =====================================================
-- TABLA: user_sessions
-- Descripción: Maneja las sesiones activas de los usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- =====================================================
-- TABLA: user_preferences
-- Descripción: Almacena las preferencias de configuración de cada usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notifications_email BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT true,
    notifications_marketing BOOLEAN DEFAULT false,
    privacy_profile VARCHAR(20) DEFAULT 'public' CHECK (privacy_profile IN ('public', 'private', 'friends')),
    auto_play_videos BOOLEAN DEFAULT true,
    playback_speed DECIMAL(3,2) DEFAULT 1.00,
    subtitle_language VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: quiz_attempts
-- Descripción: Registra los intentos de quizzes por parte de los estudiantes
-- =====================================================
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
    time_taken INTEGER, -- En segundos
    answers JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_course_quiz ON quiz_attempts(course_id, quiz_id);
CREATE INDEX idx_quiz_attempts_score ON quiz_attempts(score);

-- =====================================================
-- TABLA: user_certificates
-- Descripción: Almacena los certificados emitidos a los usuarios
-- =====================================================
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
);

-- Índices para optimizar consultas
CREATE INDEX idx_certificates_user_id ON user_certificates(user_id);
CREATE INDEX idx_certificates_course_id ON user_certificates(course_id);
CREATE INDEX idx_certificates_number ON user_certificates(certificate_number);
CREATE INDEX idx_certificates_verification ON user_certificates(verification_code);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para estadísticas de usuario
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.lastname,
    u.email,
    u.role,
    COUNT(DISTINCT ce.course_id) as total_courses,
    COUNT(DISTINCT CASE WHEN ce.status = 'completed' THEN ce.course_id END) as completed_courses,
    COUNT(DISTINCT uc.id) as certificates_earned,
    COALESCE(SUM(ua.points), 0) as total_points,
    COALESCE(SUM(lp.time_spent), 0) as total_study_time_minutes
FROM users u
LEFT JOIN course_enrollments ce ON u.id = ce.user_id
LEFT JOIN user_certificates uc ON u.id = uc.user_id AND uc.is_valid = true
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN lesson_progress lp ON u.id = lp.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.lastname, u.email, u.role;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este script crea el schema completo para el servicio de autenticación
-- Incluye todas las tablas necesarias para manejar usuarios, progreso,
-- actividades, logros, sesiones, preferencias, quizzes y certificados.

-- Para ejecutar en producción:
-- 1. Conectarse a la base de datos PostgreSQL
-- 2. Ejecutar este script completo
-- 3. Verificar que todas las tablas se crearon correctamente
-- 4. Ejecutar el script de datos de prueba si es necesario

COMMENT ON DATABASE eduplus_academy IS 'Base de datos principal de EduPlus Academy';