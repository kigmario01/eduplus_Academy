-- =====================================================
-- EDUPLUS ACADEMY - AUTH SERVICE TEST DATA
-- Script para insertar datos de prueba realistas
-- Versión: 1.0
-- Fecha: 2024-10-16
-- =====================================================

-- IMPORTANTE: Este script debe ejecutarse DESPUÉS del schema principal
-- Asegúrate de que todas las tablas estén creadas antes de ejecutar

-- =====================================================
-- INSERTAR USUARIOS DE PRUEBA
-- =====================================================

-- Estudiantes
INSERT INTO users (name, lastname, email, password, role, bio, phone, is_active, email_verified) VALUES
('Juan', 'Pérez', 'juan.perez@example.com', crypt('password123', gen_salt('bf')), 'student', 'Estudiante de ingeniería interesado en desarrollo web', '+52-555-0101', true, true),
('María', 'González', 'maria.gonzalez@example.com', crypt('password123', gen_salt('bf')), 'student', 'Diseñadora gráfica aprendiendo programación', '+52-555-0102', true, true),
('Carlos', 'Rodríguez', 'carlos.rodriguez@example.com', crypt('password123', gen_salt('bf')), 'student', 'Desarrollador junior buscando especializarse', '+52-555-0103', true, true),
('Ana', 'Martínez', 'ana.martinez@example.com', crypt('password123', gen_salt('bf')), 'student', 'Estudiante de ciencias de la computación', '+52-555-0104', true, true),
('Luis', 'López', 'luis.lopez@example.com', crypt('password123', gen_salt('bf')), 'student', 'Profesional en transición a tecnología', '+52-555-0105', true, true);

-- Instructores
INSERT INTO users (name, lastname, email, password, role, bio, phone, is_active, email_verified) VALUES
('Dr. Roberto', 'Silva', 'roberto.silva@example.com', crypt('instructor123', gen_salt('bf')), 'instructor', 'PhD en Ciencias de la Computación con 15 años de experiencia', '+52-555-0201', true, true),
('Ing. Laura', 'Fernández', 'laura.fernandez@example.com', crypt('instructor123', gen_salt('bf')), 'instructor', 'Experta en desarrollo web y arquitectura de software', '+52-555-0202', true, true),
('Mtro. Diego', 'Morales', 'diego.morales@example.com', crypt('instructor123', gen_salt('bf')), 'instructor', 'Especialista en bases de datos y análisis de datos', '+52-555-0203', true, true);

-- Administradores
INSERT INTO users (name, lastname, email, password, role, bio, phone, is_active, email_verified) VALUES
('Admin', 'Principal', 'admin@eduplus.com', crypt('admin123', gen_salt('bf')), 'admin', 'Administrador principal del sistema', '+52-555-0301', true, true);

-- =====================================================
-- INSERTAR INSCRIPCIONES A CURSOS
-- =====================================================

-- Inscripciones para Juan Pérez (ID: 1)
INSERT INTO course_enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed) VALUES
(1, 1, 85, 'active', '2024-09-01 10:00:00', '2024-10-15 14:30:00'),
(1, 2, 100, 'completed', '2024-08-15 09:00:00', '2024-09-30 16:45:00'),
(1, 3, 45, 'active', '2024-10-01 11:00:00', '2024-10-14 13:20:00');

-- Inscripciones para María González (ID: 2)
INSERT INTO course_enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed) VALUES
(2, 1, 60, 'active', '2024-09-10 14:00:00', '2024-10-15 10:15:00'),
(2, 4, 90, 'active', '2024-08-20 16:00:00', '2024-10-15 12:00:00');

-- Inscripciones para Carlos Rodríguez (ID: 3)
INSERT INTO course_enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed) VALUES
(3, 2, 75, 'active', '2024-09-05 12:00:00', '2024-10-14 15:30:00'),
(3, 3, 30, 'active', '2024-10-05 10:30:00', '2024-10-13 11:45:00'),
(3, 5, 100, 'completed', '2024-07-01 09:00:00', '2024-08-15 17:00:00');

-- Inscripciones para Ana Martínez (ID: 4)
INSERT INTO course_enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed) VALUES
(4, 1, 95, 'active', '2024-08-25 13:00:00', '2024-10-15 16:20:00'),
(4, 6, 50, 'active', '2024-09-20 15:00:00', '2024-10-12 14:10:00');

-- Inscripciones para Luis López (ID: 5)
INSERT INTO course_enrollments (user_id, course_id, progress, status, enrolled_at, last_accessed) VALUES
(5, 4, 25, 'active', '2024-10-10 11:30:00', '2024-10-15 09:45:00'),
(5, 7, 80, 'active', '2024-09-15 14:45:00', '2024-10-14 18:30:00');

-- =====================================================
-- INSERTAR PROGRESO DE LECCIONES
-- =====================================================

-- Progreso para Juan Pérez
INSERT INTO lesson_progress (user_id, course_id, lesson_id, completed, completion_percentage, time_spent, started_at, completed_at) VALUES
(1, 1, 1, true, 100, 45, '2024-09-01 10:30:00', '2024-09-01 11:15:00'),
(1, 1, 2, true, 100, 60, '2024-09-02 14:00:00', '2024-09-02 15:00:00'),
(1, 1, 3, true, 100, 75, '2024-09-03 16:00:00', '2024-09-03 17:15:00'),
(1, 1, 4, false, 85, 40, '2024-09-04 10:00:00', NULL),
(1, 2, 1, true, 100, 50, '2024-08-15 09:30:00', '2024-08-15 10:20:00'),
(1, 2, 2, true, 100, 65, '2024-08-16 11:00:00', '2024-08-16 12:05:00'),
(1, 2, 3, true, 100, 80, '2024-08-17 15:30:00', '2024-08-17 16:50:00');

-- Progreso para María González
INSERT INTO lesson_progress (user_id, course_id, lesson_id, completed, completion_percentage, time_spent, started_at, completed_at) VALUES
(2, 1, 1, true, 100, 50, '2024-09-10 14:30:00', '2024-09-10 15:20:00'),
(2, 1, 2, true, 100, 55, '2024-09-11 10:00:00', '2024-09-11 10:55:00'),
(2, 1, 3, false, 60, 35, '2024-09-12 16:00:00', NULL),
(2, 4, 1, true, 100, 70, '2024-08-20 16:30:00', '2024-08-20 17:40:00'),
(2, 4, 2, true, 100, 85, '2024-08-21 14:00:00', '2024-08-21 15:25:00');

-- =====================================================
-- INSERTAR ACTIVIDADES DE USUARIO
-- =====================================================

-- Actividades para Juan Pérez
INSERT INTO user_activities (user_id, activity_type, description, entity_type, entity_id, points_earned, created_at) VALUES
(1, 'course_enrollment', 'Se inscribió al curso de Desarrollo Web Básico', 'course', 1, 10, '2024-09-01 10:00:00'),
(1, 'lesson_completed', 'Completó la lección: Introducción a HTML', 'lesson', 1, 25, '2024-09-01 11:15:00'),
(1, 'lesson_completed', 'Completó la lección: CSS Básico', 'lesson', 2, 25, '2024-09-02 15:00:00'),
(1, 'quiz_passed', 'Aprobó el quiz de HTML con 85%', 'quiz', 1, 50, '2024-09-03 12:30:00'),
(1, 'course_completed', 'Completó el curso de JavaScript Intermedio', 'course', 2, 100, '2024-09-30 16:45:00'),
(1, 'certificate_earned', 'Obtuvo certificado de JavaScript Intermedio', 'certificate', 1, 200, '2024-09-30 17:00:00');

-- Actividades para María González
INSERT INTO user_activities (user_id, activity_type, description, entity_type, entity_id, points_earned, created_at) VALUES
(2, 'course_enrollment', 'Se inscribió al curso de Desarrollo Web Básico', 'course', 1, 10, '2024-09-10 14:00:00'),
(2, 'lesson_completed', 'Completó la lección: Introducción a HTML', 'lesson', 1, 25, '2024-09-10 15:20:00'),
(2, 'course_enrollment', 'Se inscribió al curso de Diseño UX/UI', 'course', 4, 10, '2024-08-20 16:00:00'),
(2, 'assignment_submitted', 'Entregó proyecto de diseño web', 'assignment', 1, 75, '2024-09-25 18:30:00');

-- Actividades para Carlos Rodríguez
INSERT INTO user_activities (user_id, activity_type, description, entity_type, entity_id, points_earned, created_at) VALUES
(3, 'course_enrollment', 'Se inscribió al curso de JavaScript Intermedio', 'course', 2, 10, '2024-09-05 12:00:00'),
(3, 'lesson_completed', 'Completó la lección: Variables y Funciones', 'lesson', 5, 25, '2024-09-06 14:30:00'),
(3, 'course_completed', 'Completó el curso de Git y GitHub', 'course', 5, 100, '2024-08-15 17:00:00'),
(3, 'certificate_earned', 'Obtuvo certificado de Git y GitHub', 'certificate', 2, 200, '2024-08-15 17:15:00');

-- =====================================================
-- INSERTAR LOGROS/ACHIEVEMENTS
-- =====================================================

-- Logros para Juan Pérez
INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, points, badge_color, earned_at) VALUES
(1, 'first_course', 'Primer Curso Completado', 'Has completado tu primer curso exitosamente', 'trophy', 100, 'gold', '2024-09-30 16:45:00'),
(1, 'study_streak', 'Estudiante Dedicado', 'Has estudiado por 7 días consecutivos', 'fire', 50, 'orange', '2024-10-07 20:00:00'),
(1, 'quiz_master', 'Maestro de Quizzes', 'Has aprobado 5 quizzes consecutivos', 'brain', 75, 'purple', '2024-10-10 15:30:00');

-- Logros para María González
INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, points, badge_color, earned_at) VALUES
(2, 'early_bird', 'Madrugador', 'Has completado lecciones antes de las 8 AM', 'sunrise', 25, 'yellow', '2024-09-15 07:45:00'),
(2, 'creative_mind', 'Mente Creativa', 'Has completado un proyecto de diseño', 'palette', 100, 'pink', '2024-09-25 18:30:00');

-- Logros para Carlos Rodríguez
INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, points, badge_color, earned_at) VALUES
(3, 'first_course', 'Primer Curso Completado', 'Has completado tu primer curso exitosamente', 'trophy', 100, 'gold', '2024-08-15 17:00:00'),
(3, 'code_warrior', 'Guerrero del Código', 'Has completado más de 50 ejercicios de programación', 'code', 150, 'blue', '2024-10-01 16:20:00');

-- =====================================================
-- INSERTAR PREFERENCIAS DE USUARIO
-- =====================================================

INSERT INTO user_preferences (user_id, language, timezone, theme, notifications_email, notifications_push, auto_play_videos, playback_speed) VALUES
(1, 'es', 'America/Mexico_City', 'dark', true, true, true, 1.25),
(2, 'es', 'America/Mexico_City', 'light', true, false, false, 1.00),
(3, 'es', 'America/Mexico_City', 'auto', false, true, true, 1.50),
(4, 'es', 'America/Mexico_City', 'light', true, true, true, 1.00),
(5, 'es', 'America/Mexico_City', 'dark', true, true, false, 1.25);

-- =====================================================
-- INSERTAR INTENTOS DE QUIZ
-- =====================================================

INSERT INTO quiz_attempts (user_id, course_id, quiz_id, attempt_number, score, max_score, percentage, passed, time_taken, started_at, completed_at) VALUES
(1, 1, 1, 1, 85.0, 100.0, 85.0, true, 1200, '2024-09-03 12:00:00', '2024-09-03 12:20:00'),
(1, 1, 2, 1, 92.0, 100.0, 92.0, true, 900, '2024-09-05 15:00:00', '2024-09-05 15:15:00'),
(2, 1, 1, 1, 78.0, 100.0, 78.0, true, 1500, '2024-09-12 10:30:00', '2024-09-12 10:55:00'),
(3, 2, 3, 1, 88.0, 100.0, 88.0, true, 1100, '2024-09-08 14:00:00', '2024-09-08 14:18:00'),
(3, 5, 5, 1, 95.0, 100.0, 95.0, true, 800, '2024-08-10 16:30:00', '2024-08-10 16:43:00');

-- =====================================================
-- INSERTAR CERTIFICADOS
-- =====================================================

INSERT INTO user_certificates (user_id, course_id, certificate_number, certificate_url, issued_at, verification_code) VALUES
(1, 2, 'EDUPLUS-JS-2024-001', 'https://certificates.eduplus.com/js-001.pdf', '2024-09-30 17:00:00', 'VERIFY-JS-001'),
(3, 5, 'EDUPLUS-GIT-2024-002', 'https://certificates.eduplus.com/git-002.pdf', '2024-08-15 17:15:00', 'VERIFY-GIT-002');

-- =====================================================
-- ACTUALIZAR INSCRIPCIONES COMPLETADAS
-- =====================================================

-- Marcar cursos como completados y agregar fechas
UPDATE course_enrollments SET 
    completed_at = '2024-09-30 16:45:00',
    certificate_issued = true,
    certificate_url = 'https://certificates.eduplus.com/js-001.pdf'
WHERE user_id = 1 AND course_id = 2;

UPDATE course_enrollments SET 
    completed_at = '2024-08-15 17:00:00',
    certificate_issued = true,
    certificate_url = 'https://certificates.eduplus.com/git-002.pdf'
WHERE user_id = 3 AND course_id = 5;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este script inserta datos de prueba realistas que incluyen:
-- - 5 estudiantes, 3 instructores, 1 administrador
-- - Inscripciones a múltiples cursos con diferentes niveles de progreso
-- - Progreso detallado de lecciones con tiempos realistas
-- - Actividades variadas del sistema
-- - Logros obtenidos por diferentes acciones
-- - Preferencias personalizadas de usuario
-- - Intentos de quiz con puntuaciones realistas
-- - Certificados emitidos para cursos completados

-- Para usar en desarrollo:
-- 1. Ejecutar después del script de schema
-- 2. Verificar que los datos se insertaron correctamente
-- 3. Usar estos usuarios para probar la aplicación

-- Credenciales de prueba:
-- Estudiantes: password123
-- Instructores: instructor123  
-- Admin: admin123