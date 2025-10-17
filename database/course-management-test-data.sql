-- =====================================================
-- DATOS DE PRUEBA PARA GESTIÓN DE CURSOS Y MENSAJERÍA
-- EduPlus Academy
-- =====================================================

-- =====================================================
-- CATEGORÍAS DE CURSOS
-- =====================================================

INSERT INTO course_categories (name, description, icon, color, sort_order) VALUES
('Desarrollo Web', 'Cursos de desarrollo web frontend y backend', 'code', '#3B82F6', 1),
('Programación', 'Lenguajes de programación y algoritmos', 'terminal', '#10B981', 2),
('Diseño', 'Diseño gráfico, UI/UX y herramientas creativas', 'palette', '#F59E0B', 3),
('Marketing Digital', 'Estrategias de marketing online y redes sociales', 'megaphone', '#EF4444', 4),
('Ciencia de Datos', 'Análisis de datos, machine learning e IA', 'bar-chart', '#8B5CF6', 5),
('Negocios', 'Emprendimiento, finanzas y gestión empresarial', 'briefcase', '#06B6D4', 6);

-- =====================================================
-- CURSOS
-- =====================================================

INSERT INTO courses (title, slug, description, short_description, instructor_id, category_id, level, price, original_price, duration_hours, total_lessons, thumbnail_url, status, requirements, what_you_learn, target_audience, tags, is_featured) VALUES
(
    'React Avanzado para Desarrolladores',
    'react-avanzado-desarrolladores',
    'Domina React con hooks avanzados, context API, optimización de rendimiento y patrones de diseño modernos. Aprende a construir aplicaciones escalables y mantenibles.',
    'Curso completo de React avanzado con proyectos reales',
    2, -- instructor_id (Ana García)
    1, -- Desarrollo Web
    'advanced',
    89.99,
    129.99,
    25,
    45,
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    'published',
    'Conocimientos básicos de React, JavaScript ES6+, HTML y CSS',
    'Hooks avanzados, Context API, Optimización de rendimiento, Testing con Jest, Deployment',
    'Desarrolladores con experiencia básica en React que quieren avanzar al siguiente nivel',
    ARRAY['React', 'JavaScript', 'Frontend', 'Hooks', 'Performance'],
    true
),
(
    'JavaScript Moderno ES6+',
    'javascript-moderno-es6',
    'Aprende las características más modernas de JavaScript incluyendo ES6, ES7, ES8 y más. Desde arrow functions hasta async/await.',
    'Domina JavaScript moderno con ejemplos prácticos',
    2, -- instructor_id (Ana García)
    2, -- Programación
    'intermediate',
    59.99,
    79.99,
    20,
    35,
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    'published',
    'Conocimientos básicos de JavaScript',
    'ES6+ Features, Async/Await, Modules, Destructuring, Spread Operator',
    'Desarrolladores que quieren modernizar sus conocimientos de JavaScript',
    ARRAY['JavaScript', 'ES6', 'Programming', 'Modern'],
    true
),
(
    'Node.js y Express Completo',
    'nodejs-express-completo',
    'Construye APIs REST robustas con Node.js y Express. Incluye autenticación, base de datos, testing y deployment.',
    'Backend completo con Node.js desde cero',
    3, -- instructor_id (Carlos Rodríguez)
    1, -- Desarrollo Web
    'intermediate',
    79.99,
    99.99,
    30,
    50,
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    'published',
    'JavaScript básico, conocimientos de desarrollo web',
    'Node.js, Express, MongoDB, JWT, Testing, Deployment',
    'Desarrolladores frontend que quieren aprender backend',
    ARRAY['Node.js', 'Express', 'Backend', 'API', 'MongoDB'],
    false
),
(
    'Diseño UI/UX con Figma',
    'diseno-ui-ux-figma',
    'Aprende a diseñar interfaces de usuario atractivas y funcionales usando Figma. Desde wireframes hasta prototipos interactivos.',
    'Diseño completo de interfaces con Figma',
    4, -- instructor_id (María López)
    3, -- Diseño
    'beginner',
    49.99,
    69.99,
    15,
    25,
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    'published',
    'Ninguno, curso desde cero',
    'Figma, Wireframing, Prototyping, Design Systems, User Research',
    'Diseñadores principiantes y desarrolladores que quieren mejorar sus habilidades de diseño',
    ARRAY['Figma', 'UI', 'UX', 'Design', 'Prototyping'],
    true
),
(
    'Python para Ciencia de Datos',
    'python-ciencia-datos',
    'Domina Python para análisis de datos con pandas, numpy, matplotlib y scikit-learn. Incluye proyectos de machine learning.',
    'Python aplicado a ciencia de datos y ML',
    5, -- instructor_id (David Martín)
    5, -- Ciencia de Datos
    'intermediate',
    99.99,
    139.99,
    40,
    60,
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    'published',
    'Conocimientos básicos de programación',
    'Python, Pandas, NumPy, Matplotlib, Scikit-learn, Machine Learning',
    'Analistas de datos, científicos de datos principiantes',
    ARRAY['Python', 'Data Science', 'Machine Learning', 'Pandas', 'NumPy'],
    false
),
(
    'Marketing Digital Estratégico',
    'marketing-digital-estrategico',
    'Estrategias completas de marketing digital: SEO, SEM, redes sociales, email marketing y analítica web.',
    'Marketing digital desde estrategia hasta ejecución',
    6, -- instructor_id (Laura Fernández)
    4, -- Marketing Digital
    'beginner',
    69.99,
    89.99,
    18,
    30,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    'published',
    'Conocimientos básicos de marketing',
    'SEO, SEM, Social Media, Email Marketing, Google Analytics',
    'Emprendedores, marketers principiantes, dueños de negocio',
    ARRAY['Marketing', 'SEO', 'SEM', 'Social Media', 'Analytics'],
    true
);

-- =====================================================
-- SECCIONES DE CURSO
-- =====================================================

-- Secciones para React Avanzado
INSERT INTO course_sections (course_id, title, description, sort_order) VALUES
(1, 'Introducción y Setup', 'Configuración del entorno y repaso de conceptos básicos', 1),
(1, 'Hooks Avanzados', 'useReducer, useContext, custom hooks y optimización', 2),
(1, 'Gestión de Estado', 'Context API, Zustand y patrones de estado', 3),
(1, 'Optimización de Rendimiento', 'React.memo, useMemo, useCallback y lazy loading', 4),
(1, 'Testing y Deployment', 'Jest, React Testing Library y deployment', 5);

-- Secciones para JavaScript Moderno
INSERT INTO course_sections (course_id, title, description, sort_order) VALUES
(2, 'Fundamentos ES6+', 'Let, const, arrow functions y template literals', 1),
(2, 'Destructuring y Spread', 'Destructuring de objetos y arrays, spread operator', 2),
(2, 'Programación Asíncrona', 'Promises, async/await y manejo de errores', 3),
(2, 'Módulos y Clases', 'ES6 modules, clases y herencia', 4);

-- =====================================================
-- LECCIONES
-- =====================================================

-- Lecciones para React Avanzado - Sección 1
INSERT INTO course_lessons (section_id, course_id, title, description, lesson_type, video_duration, sort_order, is_preview) VALUES
(1, 1, 'Bienvenida al curso', 'Introducción al curso y objetivos de aprendizaje', 'video', 480, 1, true),
(1, 1, 'Configuración del entorno', 'Setup de herramientas y dependencias', 'video', 720, 2, true),
(1, 1, 'Repaso de React básico', 'Componentes, props y estado básico', 'video', 900, 3, false);

-- Lecciones para React Avanzado - Sección 2
INSERT INTO course_lessons (section_id, course_id, title, description, lesson_type, video_duration, sort_order) VALUES
(2, 1, 'useReducer en profundidad', 'Cuándo y cómo usar useReducer', 'video', 1200, 1),
(2, 1, 'useContext para estado global', 'Gestión de estado con Context API', 'video', 1080, 2),
(2, 1, 'Custom Hooks avanzados', 'Creando hooks reutilizables', 'video', 960, 3),
(2, 1, 'Ejercicio práctico: Todo App', 'Aplicación completa con hooks avanzados', 'assignment', 0, 4);

-- Lecciones para JavaScript Moderno - Sección 1
INSERT INTO course_lessons (section_id, course_id, title, description, lesson_type, video_duration, sort_order, is_preview) VALUES
(5, 2, 'Introducción a ES6+', 'Qué es ES6 y por qué es importante', 'video', 600, 1, true),
(5, 2, 'Let y Const vs Var', 'Diferencias y mejores prácticas', 'video', 720, 2, false),
(5, 2, 'Arrow Functions', 'Sintaxis y diferencias con functions tradicionales', 'video', 840, 3, false);

-- =====================================================
-- INSCRIPCIONES A CURSOS
-- =====================================================

-- Inscripciones para estudiantes
INSERT INTO course_enrollments (user_id, course_id, progress, status, grade) VALUES
-- Estudiante 1 (Juan Pérez)
(7, 1, 75, 'active', 85.5),
(7, 2, 100, 'completed', 92.0),
(7, 4, 30, 'active', NULL),

-- Estudiante 2 (Elena Ruiz)
(8, 1, 45, 'active', NULL),
(8, 3, 80, 'active', 88.0),
(8, 5, 60, 'active', NULL),

-- Estudiante 3 (Miguel Torres)
(9, 2, 100, 'completed', 95.5),
(9, 3, 25, 'active', NULL),
(9, 6, 90, 'active', 91.0),

-- Estudiante 4 (Carmen Silva)
(10, 1, 90, 'active', 89.5),
(10, 4, 100, 'completed', 94.0),
(10, 5, 15, 'active', NULL);

-- =====================================================
-- PROGRESO DE LECCIONES
-- =====================================================

-- Progreso para Juan Pérez en React Avanzado
INSERT INTO lesson_progress (user_id, course_id, lesson_id, completed, completion_percentage, time_spent) VALUES
(7, 1, 1, true, 100, 480),
(7, 1, 2, true, 100, 720),
(7, 1, 3, true, 100, 900),
(7, 1, 4, true, 100, 1200),
(7, 1, 5, true, 100, 1080),
(7, 1, 6, false, 60, 576);

-- =====================================================
-- RESEÑAS DE CURSOS
-- =====================================================

INSERT INTO course_reviews (course_id, user_id, rating, title, comment) VALUES
(1, 7, 5, 'Excelente curso de React', 'El mejor curso de React que he tomado. Muy bien explicado y con ejemplos prácticos.'),
(1, 8, 4, 'Muy bueno pero intenso', 'Contenido de calidad pero requiere dedicación. Recomendado para desarrolladores con experiencia.'),
(2, 7, 5, 'JavaScript moderno explicado perfectamente', 'Ana explica de manera muy clara todos los conceptos. Perfecto para actualizar conocimientos.'),
(2, 9, 5, 'Imprescindible para cualquier desarrollador', 'Curso fundamental para entender JavaScript moderno. Muy recomendado.'),
(3, 8, 4, 'Buen curso de Node.js', 'Carlos domina el tema y explica muy bien. Algunos ejemplos podrían ser más actuales.'),
(4, 10, 5, 'Perfecto para empezar en diseño', 'María hace que Figma sea fácil de entender. Excelente para principiantes.'),
(5, 8, 4, 'Muy completo para ciencia de datos', 'David cubre muchos temas importantes. A veces va un poco rápido.'),
(6, 9, 5, 'Marketing digital al día', 'Laura conoce muy bien las tendencias actuales. Curso muy práctico.');

-- =====================================================
-- CONVERSACIONES Y MENSAJERÍA
-- =====================================================

-- Conversaciones de soporte por curso
INSERT INTO conversations (title, conversation_type, course_id, created_by) VALUES
('Soporte - React Avanzado', 'course_support', 1, 7),
('Soporte - JavaScript Moderno', 'course_support', 2, 8),
('Consulta sobre Node.js', 'course_support', 3, 8),
('Ayuda con Figma', 'course_support', 4, 10);

-- Conversaciones directas entre usuarios
INSERT INTO conversations (title, conversation_type, created_by) VALUES
('Consulta sobre proyecto', 'direct', 7),
('Colaboración en curso', 'direct', 8);

-- Participantes en conversaciones
INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES
-- Conversación 1: Soporte React (Juan + Ana)
(1, 7, 'member'),
(1, 2, 'admin'),

-- Conversación 2: Soporte JavaScript (Elena + Ana)
(2, 8, 'member'),
(2, 2, 'admin'),

-- Conversación 3: Soporte Node.js (Elena + Carlos)
(3, 8, 'member'),
(3, 3, 'admin'),

-- Conversación 4: Soporte Figma (Carmen + María)
(4, 10, 'member'),
(4, 4, 'admin'),

-- Conversación 5: Directa Juan-Elena
(5, 7, 'admin'),
(5, 8, 'member'),

-- Conversación 6: Directa Elena-Miguel
(6, 8, 'admin'),
(6, 9, 'member');

-- =====================================================
-- MENSAJES
-- =====================================================

-- Mensajes en conversación de soporte React
INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES
(1, 7, 'Hola Ana, tengo una duda sobre useReducer. ¿Cuándo es mejor usarlo en lugar de useState?', 'text'),
(1, 2, 'Hola Juan! useReducer es ideal cuando tienes estado complejo con múltiples sub-valores o cuando la lógica de actualización es compleja. Te recomiendo usarlo cuando tengas más de 3-4 estados relacionados.', 'text'),
(1, 7, 'Perfecto, eso me aclara mucho. ¿Podrías darme un ejemplo práctico?', 'text'),
(1, 2, 'Claro! Imagina un formulario con validación. En lugar de tener useState para cada campo y sus errores, useReducer te permite manejar todo el estado del formulario en un solo lugar.', 'text');

-- Mensajes en conversación de soporte JavaScript
INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES
(2, 8, 'Ana, no entiendo bien la diferencia entre map() y forEach(). ¿Podrías explicármelo?', 'text'),
(2, 2, 'Hola Elena! La diferencia principal es que map() devuelve un nuevo array con los elementos transformados, mientras que forEach() solo ejecuta una función para cada elemento sin devolver nada.', 'text'),
(2, 8, 'Ah, entonces map() es para transformar datos y forEach() para efectos secundarios?', 'text'),
(2, 2, 'Exacto! Usa map() cuando quieras crear un nuevo array basado en el original, y forEach() cuando solo quieras hacer algo con cada elemento (como console.log).', 'text');

-- Mensajes en conversación directa
INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES
(5, 7, 'Hola Elena, vi que también estás tomando el curso de React. ¿Te gustaría hacer el proyecto final juntos?', 'text'),
(5, 8, 'Hola Juan! Me parece una excelente idea. Podríamos combinar lo que estoy aprendiendo de Node.js también.', 'text'),
(5, 7, 'Perfecto! ¿Qué te parece si hacemos una aplicación de gestión de tareas con React y Node.js?', 'text'),
(5, 8, 'Me encanta la idea. ¿Cuándo podemos empezar?', 'text');

-- =====================================================
-- ANUNCIOS DE CURSO
-- =====================================================

INSERT INTO course_announcements (course_id, instructor_id, title, content, is_important) VALUES
(1, 2, 'Nueva sección agregada', 'He agregado una nueva sección sobre testing con React Testing Library. ¡No se la pierdan!', true),
(1, 2, 'Sesión en vivo programada', 'Tendremos una sesión en vivo el viernes a las 7 PM para resolver dudas sobre hooks avanzados.', false),
(2, 2, 'Actualización del curso', 'He actualizado el contenido para incluir las últimas características de ES2023.', false),
(3, 3, 'Proyecto final disponible', 'Ya está disponible el proyecto final del curso. Pueden encontrarlo en la última sección.', true);

-- =====================================================
-- NOTIFICACIONES
-- =====================================================

INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id) VALUES
(7, 'Nuevo mensaje de Ana García', 'Ana García te ha respondido en el soporte del curso React Avanzado', 'message', 'conversation', 1),
(7, 'Nuevo anuncio en React Avanzado', 'Ana García ha publicado un nuevo anuncio en el curso', 'announcement', 'course', 1),
(8, 'Nuevo mensaje de Ana García', 'Ana García te ha respondido en el soporte del curso JavaScript Moderno', 'message', 'conversation', 2),
(8, 'Nuevo mensaje de Juan Pérez', 'Juan Pérez te ha enviado un mensaje', 'message', 'conversation', 5),
(10, 'Nuevo mensaje de María López', 'María López te ha respondido en el soporte del curso de Figma', 'message', 'conversation', 4),
(9, 'Nuevo mensaje de Elena Ruiz', 'Elena Ruiz te ha enviado un mensaje', 'message', 'conversation', 6);

-- =====================================================
-- ACTIVIDADES DE USUARIO ADICIONALES
-- =====================================================

INSERT INTO user_activities (user_id, activity_type, description, entity_type, entity_id, points_earned) VALUES
-- Actividades de Juan Pérez
(7, 'course_enrollment', 'Se inscribió en el curso React Avanzado para Desarrolladores', 'course', 1, 10),
(7, 'lesson_completed', 'Completó la lección: Bienvenida al curso', 'lesson', 1, 5),
(7, 'lesson_completed', 'Completó la lección: Configuración del entorno', 'lesson', 2, 5),
(7, 'course_review', 'Escribió una reseña para React Avanzado para Desarrolladores', 'course', 1, 15),
(7, 'message_sent', 'Envió un mensaje en el soporte del curso', 'conversation', 1, 2),

-- Actividades de Elena Ruiz
(8, 'course_enrollment', 'Se inscribió en el curso React Avanzado para Desarrolladores', 'course', 1, 10),
(8, 'course_enrollment', 'Se inscribió en el curso Node.js y Express Completo', 'course', 3, 10),
(8, 'lesson_completed', 'Completó la lección: Introducción a ES6+', 'lesson', 8, 5),
(8, 'course_review', 'Escribió una reseña para React Avanzado para Desarrolladores', 'course', 1, 15),

-- Actividades de Miguel Torres
(9, 'course_completion', 'Completó el curso JavaScript Moderno ES6+', 'course', 2, 50),
(9, 'course_review', 'Escribió una reseña para JavaScript Moderno ES6+', 'course', 2, 15),
(9, 'course_enrollment', 'Se inscribió en el curso Marketing Digital Estratégico', 'course', 6, 10),

-- Actividades de Carmen Silva
(10, 'course_enrollment', 'Se inscribió en el curso React Avanzado para Desarrolladores', 'course', 1, 10),
(10, 'course_completion', 'Completó el curso Diseño UI/UX con Figma', 'course', 4, 50),
(10, 'course_review', 'Escribió una reseña para Diseño UI/UX con Figma', 'course', 4, 15);

-- =====================================================
-- ACTUALIZAR ESTADÍSTICAS DE CURSOS
-- =====================================================

-- Actualizar conteos de inscripciones
UPDATE courses SET enrollment_count = (
    SELECT COUNT(*) FROM course_enrollments 
    WHERE course_id = courses.id AND status IN ('active', 'completed')
);

-- Actualizar ratings promedio
UPDATE courses SET 
    average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM course_reviews 
        WHERE course_id = courses.id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM course_reviews 
        WHERE course_id = courses.id
    );

-- Actualizar conteo de lecciones
UPDATE courses SET total_lessons = (
    SELECT COUNT(*) 
    FROM course_lessons 
    WHERE course_id = courses.id AND is_published = true
);

-- =====================================================
-- ACTUALIZAR ESTADÍSTICAS DE USUARIOS
-- =====================================================

-- Actualizar puntos de estudiantes
UPDATE users SET student_points = (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM user_activities 
    WHERE user_id = users.id
) WHERE role = 'student';

-- Actualizar estadísticas de instructores
UPDATE users SET 
    instructor_total_courses = (
        SELECT COUNT(*) 
        FROM courses 
        WHERE instructor_id = users.id AND status = 'published'
    ),
    instructor_total_students = (
        SELECT COUNT(DISTINCT ce.user_id)
        FROM courses c
        JOIN course_enrollments ce ON c.id = ce.course_id
        WHERE c.instructor_id = users.id AND ce.status IN ('active', 'completed')
    ),
    instructor_total_reviews = (
        SELECT COUNT(*)
        FROM courses c
        JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.instructor_id = users.id
    ),
    instructor_rating = (
        SELECT COALESCE(AVG(cr.rating), 0)
        FROM courses c
        JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.instructor_id = users.id
    )
WHERE role = 'instructor';