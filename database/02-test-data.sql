-- =====================================================
-- DATOS DE PRUEBA PARA EDUPLUS ACADEMY
-- =====================================================

-- Insertar categorías de cursos
INSERT INTO course_categories (name, description) VALUES
('Programación', 'Cursos de desarrollo de software y programación'),
('Diseño', 'Cursos de diseño gráfico, UX/UI y diseño web'),
('Marketing', 'Cursos de marketing digital y estrategias de ventas'),
('Negocios', 'Cursos de administración, emprendimiento y finanzas'),
('Idiomas', 'Cursos de idiomas extranjeros'),
('Ciencias', 'Cursos de matemáticas, física, química y ciencias naturales')
ON CONFLICT DO NOTHING;

-- Insertar usuarios de prueba
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) VALUES
('admin@eduplus.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Admin', 'EduPlus', 'admin', true),
('instructor1@eduplus.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'María', 'García', 'instructor', true),
('instructor2@eduplus.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Carlos', 'López', 'instructor', true),
('student1@eduplus.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Ana', 'Martínez', 'student', true),
('student2@eduplus.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Luis', 'Rodríguez', 'student', true),
('student3@eduplus.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Sofia', 'Hernández', 'student', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar cursos de prueba
INSERT INTO courses (title, description, short_description, instructor_id, category_id, price, duration_hours, level, status, requirements, what_you_learn) VALUES
(
    'Introducción a JavaScript',
    'Aprende los fundamentos de JavaScript desde cero. Este curso te llevará desde los conceptos básicos hasta la programación orientada a objetos.',
    'Curso completo de JavaScript para principiantes',
    2, 1, 99.99, 20, 'beginner', 'published',
    ARRAY['Conocimientos básicos de HTML', 'Ganas de aprender'],
    ARRAY['Variables y tipos de datos', 'Funciones y scope', 'DOM manipulation', 'Programación orientada a objetos']
),
(
    'React.js Avanzado',
    'Domina React.js con hooks, context API, y patrones avanzados de desarrollo.',
    'Curso avanzado de React.js con proyectos reales',
    2, 1, 149.99, 35, 'advanced', 'published',
    ARRAY['JavaScript intermedio', 'Conocimientos de ES6+', 'Experiencia con HTML/CSS'],
    ARRAY['React Hooks avanzados', 'Context API', 'Testing con Jest', 'Optimización de performance']
),
(
    'Diseño UX/UI Completo',
    'Aprende a diseñar interfaces de usuario atractivas y funcionales.',
    'Curso completo de diseño UX/UI desde cero',
    3, 2, 129.99, 25, 'intermediate', 'published',
    ARRAY['Conocimientos básicos de diseño', 'Software de diseño (Figma recomendado)'],
    ARRAY['Principios de UX', 'Diseño de interfaces', 'Prototipado', 'Testing de usabilidad']
),
(
    'Marketing Digital 2024',
    'Estrategias modernas de marketing digital para hacer crecer tu negocio.',
    'Curso actualizado de marketing digital',
    3, 3, 89.99, 18, 'beginner', 'draft',
    ARRAY['Conocimientos básicos de negocios'],
    ARRAY['SEO y SEM', 'Redes sociales', 'Email marketing', 'Analytics y métricas']
)
ON CONFLICT DO NOTHING;

-- Insertar secciones de cursos
INSERT INTO course_sections (course_id, title, description, order_index) VALUES
(1, 'Fundamentos de JavaScript', 'Conceptos básicos y sintaxis', 1),
(1, 'Funciones y Scope', 'Trabajando con funciones', 2),
(1, 'DOM y Eventos', 'Manipulación del DOM', 3),
(2, 'Hooks Avanzados', 'useEffect, useContext, custom hooks', 1),
(2, 'Gestión de Estado', 'Context API y Redux', 2),
(2, 'Testing y Optimización', 'Jest, React Testing Library', 3),
(3, 'Fundamentos de UX', 'Principios de experiencia de usuario', 1),
(3, 'Diseño de Interfaces', 'UI Design y componentes', 2)
ON CONFLICT DO NOTHING;

-- Insertar lecciones
INSERT INTO course_lessons (section_id, title, description, content_type, duration_minutes, order_index) VALUES
(1, 'Variables y Tipos de Datos', 'Aprende sobre variables, strings, números y booleanos', 'video', 15, 1),
(1, 'Operadores y Expresiones', 'Operadores aritméticos, lógicos y de comparación', 'video', 12, 2),
(1, 'Estructuras de Control', 'If/else, switch, loops', 'video', 18, 3),
(2, 'Declaración de Funciones', 'Function declarations vs expressions', 'video', 14, 1),
(2, 'Scope y Closures', 'Entendiendo el scope en JavaScript', 'video', 16, 2),
(3, 'Selección de Elementos', 'querySelector y getElementById', 'video', 10, 1),
(3, 'Eventos del DOM', 'addEventListener y event handling', 'video', 13, 2),
(4, 'useState y useEffect', 'Hooks básicos de React', 'video', 20, 1),
(4, 'Custom Hooks', 'Creando tus propios hooks', 'video', 18, 2),
(5, 'Context API', 'Gestión de estado global', 'video', 22, 1),
(6, 'Fundamentos de UX', 'Qué es la experiencia de usuario', 'video', 25, 1),
(7, 'Principios de Diseño', 'Color, tipografía, espaciado', 'video', 20, 1)
ON CONFLICT DO NOTHING;

-- Insertar inscripciones de prueba
INSERT INTO course_enrollments (user_id, course_id, progress_percentage) VALUES
(4, 1, 45.5),
(4, 3, 12.0),
(5, 1, 78.2),
(5, 2, 23.1),
(6, 1, 100.0),
(6, 3, 67.8)
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Insertar progreso de lecciones
INSERT INTO lesson_progress (user_id, lesson_id, completed, time_spent_minutes) VALUES
(4, 1, true, 15),
(4, 2, true, 12),
(4, 3, false, 8),
(5, 1, true, 15),
(5, 2, true, 12),
(5, 3, true, 18),
(5, 4, true, 14),
(5, 5, false, 7),
(6, 1, true, 15),
(6, 2, true, 12),
(6, 3, true, 18),
(6, 4, true, 14),
(6, 5, true, 16),
(6, 6, true, 10),
(6, 7, true, 13)
ON CONFLICT (user_id, lesson_id) DO NOTHING;

-- Insertar reseñas de cursos
INSERT INTO course_reviews (user_id, course_id, rating, comment) VALUES
(6, 1, 5, 'Excelente curso para principiantes. Muy bien explicado.'),
(5, 1, 4, 'Buen contenido, aunque podría tener más ejercicios prácticos.'),
(4, 3, 5, 'Me encantó el enfoque práctico del diseño UX.')
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Insertar conversaciones de prueba
INSERT INTO conversations (title, type, course_id, created_by) VALUES
('Dudas sobre JavaScript', 'group', 1, 4),
('Consulta sobre React Hooks', 'direct', 2, 5)
ON CONFLICT DO NOTHING;

-- Insertar participantes en conversaciones
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, 2), -- Instructor María
(1, 4), -- Estudiante Ana
(1, 5), -- Estudiante Luis
(2, 2), -- Instructor María
(2, 5)  -- Estudiante Luis
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Insertar mensajes de prueba
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(1, 4, '¡Hola! Tengo una duda sobre las funciones en JavaScript.'),
(1, 2, 'Hola Ana, ¿cuál es tu duda específicamente?'),
(1, 4, '¿Cuál es la diferencia entre function declaration y function expression?'),
(1, 2, 'Excelente pregunta. Las function declarations se "elevan" (hoisting) mientras que las expressions no.'),
(2, 5, 'Hola María, ¿podrías explicarme mejor el useEffect?'),
(2, 2, 'Por supuesto Luis. useEffect se ejecuta después de cada render del componente.')
ON CONFLICT DO NOTHING;