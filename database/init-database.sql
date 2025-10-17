-- =====================================================
-- SCRIPT DE INICIALIZACIÓN COMPLETA DE BASE DE DATOS
-- EduPlus Academy - Producción
-- =====================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS eduplus_academy;

-- Conectar a la base de datos
\c eduplus_academy;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ESQUEMA DE AUTH-SERVICE
-- =====================================================

-- Tabla de usuarios
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
);

-- Tabla de inscripciones a cursos
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
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- en minutos
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_position INTEGER DEFAULT 0, -- posición en video/contenido
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, lesson_id)
);

-- Tabla de actividades de usuario
CREATE TABLE IF NOT EXISTS user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    entity_type VARCHAR(50), -- 'course', 'lesson', 'quiz', etc.
    entity_id INTEGER,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logros de usuario
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

-- Tabla de preferencias de usuario
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
);

-- Tabla de sesiones de usuario
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de intentos de quiz
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
    time_taken INTEGER, -- en segundos
    answers JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de certificados
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

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Índices para inscripciones
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed_at ON course_enrollments(completed_at);

-- Índices para progreso de lecciones
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(completed);

-- Índices para actividades
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON user_activities(created_at);

-- Índices para logros
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON user_achievements(earned_at);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamp
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
-- VISTAS PARA ESTADÍSTICAS
-- =====================================================

-- Vista de estadísticas de usuario
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.lastname,
    u.email,
    u.role,
    COUNT(DISTINCT ce.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN ce.status = 'completed' THEN ce.id END) as completed_courses,
    COUNT(DISTINCT uc.id) as total_certificates,
    COALESCE(SUM(ua.points_earned), 0) as total_points,
    COALESCE(SUM(lp.time_spent), 0) / 60.0 as hours_studied,
    COUNT(DISTINCT uach.id) as total_achievements,
    -- Calcular streak actual (simplificado)
    CASE 
        WHEN MAX(ua.created_at) >= CURRENT_DATE - INTERVAL '1 day' THEN 
            COALESCE((
                SELECT COUNT(DISTINCT DATE(created_at))
                FROM user_activities 
                WHERE user_id = u.id 
                AND created_at >= CURRENT_DATE - INTERVAL '30 days'
            ), 0)
        ELSE 0 
    END as current_streak,
    -- Meta semanal (fija por ahora)
    10 as weekly_goal,
    -- Progreso semanal
    COALESCE(SUM(
        CASE 
            WHEN lp.created_at >= CURRENT_DATE - INTERVAL '7 days' 
            THEN lp.time_spent 
            ELSE 0 
        END
    ), 0) / 60.0 as weekly_progress
FROM users u
LEFT JOIN course_enrollments ce ON u.id = ce.user_id
LEFT JOIN user_certificates uc ON u.id = uc.user_id
LEFT JOIN user_activities ua ON u.id = ua.user_id
LEFT JOIN lesson_progress lp ON u.id = lp.user_id
LEFT JOIN user_achievements uach ON u.id = uach.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.lastname, u.email, u.role;

-- =====================================================
-- DATOS DE PRUEBA PARA DESARROLLO
-- =====================================================

-- Insertar usuarios de prueba
INSERT INTO users (name, lastname, email, password, role, avatar_url, phone, bio, email_verified) VALUES
('Juan Carlos', 'Pérez García', 'juan.perez@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'student', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+52-555-0101', 'Estudiante de desarrollo web con pasión por la tecnología.', true),
('María Elena', 'González López', 'maria.gonzalez@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'student', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', '+52-555-0102', 'Diseñadora gráfica interesada en UX/UI.', true),
('Carlos Alberto', 'Rodríguez Martín', 'carlos.rodriguez@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'instructor', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '+52-555-0103', 'Instructor de programación con 10 años de experiencia.', true),
('Ana Sofía', 'Hernández Cruz', 'ana.hernandez@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'student', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', '+52-555-0104', 'Estudiante de ciencias de la computación.', true),
('Roberto', 'Jiménez Flores', 'roberto.jimenez@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'admin', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+52-555-0105', 'Administrador de la plataforma educativa.', true),
('Laura Patricia', 'Morales Vega', 'laura.morales@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'instructor', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '+52-555-0106', 'Especialista en marketing digital y redes sociales.', true),
('Diego Alejandro', 'Torres Silva', 'diego.torres@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'student', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150', '+52-555-0107', 'Emprendedor interesado en e-commerce.', false),
('Valeria', 'Castillo Ramírez', 'valeria.castillo@example.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'student', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150', '+52-555-0108', 'Estudiante de ingeniería en sistemas.', true);

-- Insertar inscripciones a cursos
INSERT INTO course_enrollments (user_id, course_id, progress, status, grade, certificate_issued, last_accessed) VALUES
(1, 101, 100, 'completed', 95.50, true, NOW() - INTERVAL '2 days'),
(1, 102, 75, 'active', NULL, false, NOW() - INTERVAL '1 hour'),
(1, 103, 30, 'active', NULL, false, NOW() - INTERVAL '3 days'),
(2, 101, 100, 'completed', 88.75, true, NOW() - INTERVAL '1 week'),
(2, 104, 60, 'active', NULL, false, NOW() - INTERVAL '2 hours'),
(3, 105, 100, 'completed', 92.00, true, NOW() - INTERVAL '1 month'),
(4, 101, 45, 'active', NULL, false, NOW() - INTERVAL '1 day'),
(4, 102, 20, 'paused', NULL, false, NOW() - INTERVAL '1 week'),
(5, 106, 100, 'completed', 97.25, true, NOW() - INTERVAL '2 weeks'),
(6, 107, 80, 'active', NULL, false, NOW() - INTERVAL '3 hours'),
(7, 101, 15, 'active', NULL, false, NOW() - INTERVAL '2 days'),
(8, 102, 55, 'active', NULL, false, NOW() - INTERVAL '4 hours');

-- Insertar progreso de lecciones
INSERT INTO lesson_progress (user_id, course_id, lesson_id, completed, completion_percentage, time_spent, started_at, completed_at) VALUES
-- Usuario 1 - Curso 101 (completado)
(1, 101, 1, true, 100, 45, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'),
(1, 101, 2, true, 100, 60, NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
(1, 101, 3, true, 100, 55, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
(1, 101, 4, true, 100, 70, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(1, 101, 5, true, 100, 50, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
-- Usuario 1 - Curso 102 (en progreso)
(1, 102, 1, true, 100, 40, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(1, 102, 2, true, 100, 55, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(1, 102, 3, false, 75, 30, NOW() - INTERVAL '1 hour', NULL),
-- Usuario 2 - Curso 101 (completado)
(2, 101, 1, true, 100, 50, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'),
(2, 101, 2, true, 100, 65, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(2, 101, 3, true, 100, 45, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
(2, 101, 4, true, 100, 75, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(2, 101, 5, true, 100, 55, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
-- Usuario 4 - Curso 101 (en progreso)
(4, 101, 1, true, 100, 35, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(4, 101, 2, false, 60, 25, NOW() - INTERVAL '1 day', NULL);

-- Insertar actividades de usuario
INSERT INTO user_activities (user_id, activity_type, description, metadata, entity_type, entity_id, points_earned) VALUES
(1, 'course_enrollment', 'Se inscribió al curso "Desarrollo Web Completo"', '{"course_title": "Desarrollo Web Completo"}', 'course', 101, 10),
(1, 'lesson_completed', 'Completó la lección "Introducción a HTML"', '{"lesson_title": "Introducción a HTML", "time_spent": 45}', 'lesson', 1, 25),
(1, 'course_completed', 'Completó el curso "Desarrollo Web Completo"', '{"course_title": "Desarrollo Web Completo", "final_grade": 95.5}', 'course', 101, 100),
(1, 'certificate_earned', 'Obtuvo certificado del curso "Desarrollo Web Completo"', '{"certificate_id": "CERT-101-001"}', 'certificate', 1, 50),
(1, 'quiz_passed', 'Aprobó el quiz "Fundamentos de HTML"', '{"quiz_score": 90, "max_score": 100}', 'quiz', 1, 30),
(2, 'course_enrollment', 'Se inscribió al curso "Desarrollo Web Completo"', '{"course_title": "Desarrollo Web Completo"}', 'course', 101, 10),
(2, 'course_completed', 'Completó el curso "Desarrollo Web Completo"', '{"course_title": "Desarrollo Web Completo", "final_grade": 88.75}', 'course', 101, 100),
(2, 'certificate_earned', 'Obtuvo certificado del curso "Desarrollo Web Completo"', '{"certificate_id": "CERT-101-002"}', 'certificate', 2, 50),
(3, 'course_completed', 'Completó el curso "JavaScript Avanzado"', '{"course_title": "JavaScript Avanzado", "final_grade": 92.0}', 'course', 105, 100),
(4, 'course_enrollment', 'Se inscribió al curso "Desarrollo Web Completo"', '{"course_title": "Desarrollo Web Completo"}', 'course', 101, 10),
(4, 'lesson_completed', 'Completó la lección "Introducción a HTML"', '{"lesson_title": "Introducción a HTML", "time_spent": 35}', 'lesson', 1, 25),
(5, 'course_completed', 'Completó el curso "Administración de Sistemas"', '{"course_title": "Administración de Sistemas", "final_grade": 97.25}', 'course', 106, 100);

-- Insertar logros de usuario
INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, points, badge_color, metadata) VALUES
(1, 'first_course', 'Primer Curso Completado', 'Has completado tu primer curso en la plataforma', 'graduation-cap', 100, 'gold', '{"course_id": 101}'),
(1, 'quick_learner', 'Aprendiz Rápido', 'Completaste un curso en menos de 2 semanas', 'zap', 75, 'blue', '{"days_taken": 10}'),
(1, 'quiz_master', 'Maestro de Quizzes', 'Aprobaste 5 quizzes consecutivos', 'brain', 50, 'purple', '{"quizzes_passed": 5}'),
(2, 'first_course', 'Primer Curso Completado', 'Has completado tu primer curso en la plataforma', 'graduation-cap', 100, 'gold', '{"course_id": 101}'),
(2, 'dedicated_student', 'Estudiante Dedicado', 'Estudiaste 3 días consecutivos', 'fire', 60, 'orange', '{"streak_days": 3}'),
(3, 'expert_level', 'Nivel Experto', 'Alcanzaste una calificación superior al 90%', 'star', 150, 'gold', '{"grade": 92.0}'),
(5, 'admin_achievement', 'Administrador Ejemplar', 'Completaste el curso de administración', 'shield', 200, 'red', '{"course_id": 106}');

-- Insertar preferencias de usuario
INSERT INTO user_preferences (user_id, language, timezone, theme, notifications_email, notifications_push, auto_play_videos, playback_speed) VALUES
(1, 'es', 'America/Mexico_City', 'light', true, true, true, 1.25),
(2, 'es', 'America/Mexico_City', 'dark', true, false, false, 1.00),
(3, 'en', 'America/New_York', 'light', false, true, true, 1.50),
(4, 'es', 'America/Mexico_City', 'auto', true, true, true, 1.00),
(5, 'es', 'America/Mexico_City', 'dark', true, true, false, 1.25),
(6, 'es', 'America/Mexico_City', 'light', true, false, true, 1.00),
(7, 'es', 'America/Mexico_City', 'light', false, false, true, 1.00),
(8, 'es', 'America/Mexico_City', 'auto', true, true, true, 1.25);

-- Insertar intentos de quiz
INSERT INTO quiz_attempts (user_id, course_id, quiz_id, attempt_number, score, max_score, percentage, passed, time_taken, answers, completed_at) VALUES
(1, 101, 1, 1, 90.00, 100.00, 90.00, true, 1200, '{"q1": "a", "q2": "b", "q3": "c"}', NOW() - INTERVAL '10 days'),
(1, 101, 2, 1, 85.00, 100.00, 85.00, true, 900, '{"q1": "b", "q2": "a", "q3": "c"}', NOW() - INTERVAL '8 days'),
(2, 101, 1, 1, 75.00, 100.00, 75.00, true, 1500, '{"q1": "a", "q2": "c", "q3": "b"}', NOW() - INTERVAL '15 days'),
(2, 101, 2, 1, 80.00, 100.00, 80.00, true, 1100, '{"q1": "b", "q2": "a", "q3": "c"}', NOW() - INTERVAL '12 days'),
(4, 101, 1, 1, 65.00, 100.00, 65.00, false, 1800, '{"q1": "c", "q2": "b", "q3": "a"}', NOW() - INTERVAL '2 days'),
(4, 101, 1, 2, 78.00, 100.00, 78.00, true, 1400, '{"q1": "a", "q2": "b", "q3": "c"}', NOW() - INTERVAL '1 day');

-- Insertar certificados
INSERT INTO user_certificates (user_id, course_id, certificate_number, certificate_url, verification_code, metadata) VALUES
(1, 101, 'CERT-EDU-101-001', 'https://certificates.eduplus.com/cert-101-001.pdf', 'VER-ABC123', '{"course_title": "Desarrollo Web Completo", "instructor": "Carlos Rodríguez", "grade": 95.5}'),
(2, 101, 'CERT-EDU-101-002', 'https://certificates.eduplus.com/cert-101-002.pdf', 'VER-DEF456', '{"course_title": "Desarrollo Web Completo", "instructor": "Carlos Rodríguez", "grade": 88.75}'),
(3, 105, 'CERT-EDU-105-001', 'https://certificates.eduplus.com/cert-105-001.pdf', 'VER-GHI789', '{"course_title": "JavaScript Avanzado", "instructor": "Laura Morales", "grade": 92.0}'),
(5, 106, 'CERT-EDU-106-001', 'https://certificates.eduplus.com/cert-106-001.pdf', 'VER-JKL012', '{"course_title": "Administración de Sistemas", "instructor": "Roberto Jiménez", "grade": 97.25}');

-- =====================================================
-- CONFIGURACIÓN FINAL
-- =====================================================

-- Actualizar secuencias para evitar conflictos
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('course_enrollments_id_seq', (SELECT MAX(id) FROM course_enrollments));
SELECT setval('lesson_progress_id_seq', (SELECT MAX(id) FROM lesson_progress));
SELECT setval('user_activities_id_seq', (SELECT MAX(id) FROM user_activities));
SELECT setval('user_achievements_id_seq', (SELECT MAX(id) FROM user_achievements));
SELECT setval('user_preferences_id_seq', (SELECT MAX(id) FROM user_preferences));
SELECT setval('quiz_attempts_id_seq', (SELECT MAX(id) FROM quiz_attempts));
SELECT setval('user_certificates_id_seq', (SELECT MAX(id) FROM user_certificates));

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos EduPlus Academy inicializada correctamente';
    RAISE NOTICE '📊 Usuarios creados: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '📚 Inscripciones creadas: %', (SELECT COUNT(*) FROM course_enrollments);
    RAISE NOTICE '🎯 Actividades creadas: %', (SELECT COUNT(*) FROM user_activities);
    RAISE NOTICE '🏆 Logros creados: %', (SELECT COUNT(*) FROM user_achievements);
    RAISE NOTICE '📜 Certificados creados: %', (SELECT COUNT(*) FROM user_certificates);
END $$;

-- =====================================================
-- CREDENCIALES DE PRUEBA
-- =====================================================
/*
CREDENCIALES PARA TESTING:

Estudiantes:
- juan.perez@example.com / password123
- maria.gonzalez@example.com / password123
- ana.hernandez@example.com / password123
- diego.torres@example.com / password123
- valeria.castillo@example.com / password123

Instructores:
- carlos.rodriguez@example.com / password123
- laura.morales@example.com / password123

Administrador:
- roberto.jimenez@example.com / password123

Nota: Todas las contraseñas están hasheadas con bcrypt.
Para testing, usar: password123
*/