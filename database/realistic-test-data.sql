-- Datos de prueba realistas para EduPlus Academy

-- Insertar usuarios (instructores y estudiantes)
INSERT INTO users (email, password_hash, first_name, last_name, avatar_url, phone, country, city, role, status, email_verified, profile_completed, bio, instructor_approved, instructor_bio, instructor_experience_years, instructor_specialties, student_points, student_level) VALUES
-- Instructores
('carlos.rodriguez@eduplus.com', '$2b$10$example_hash_1', 'Carlos', 'Rodríguez', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+34-600-123-456', 'España', 'Madrid', 'instructor', 'active', true, true, 'Desarrollador Full Stack con más de 8 años de experiencia en tecnologías web modernas.', true, 'Especialista en React, Node.js y arquitecturas de microservicios. He trabajado en startups y grandes corporaciones, liderando equipos de desarrollo.', 8, ARRAY['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'], 0, 1),

('maria.gonzalez@eduplus.com', '$2b$10$example_hash_2', 'María', 'González', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', '+34-600-234-567', 'España', 'Barcelona', 'instructor', 'active', true, true, 'Diseñadora UX/UI con pasión por crear experiencias digitales excepcionales.', true, 'Experta en diseño centrado en el usuario, prototipado y herramientas como Figma y Adobe Creative Suite. He trabajado con empresas Fortune 500.', 6, ARRAY['UX/UI Design', 'Figma', 'Adobe Creative Suite', 'Design Thinking', 'Prototyping'], 0, 1),

('david.martinez@eduplus.com', '$2b$10$example_hash_3', 'David', 'Martínez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '+34-600-345-678', 'España', 'Valencia', 'instructor', 'active', true, true, 'Especialista en ciberseguridad y administración de redes con certificaciones CISSP y CEH.', true, 'Consultor en ciberseguridad con experiencia en pentesting, análisis forense y gestión de incidentes. Certificado en múltiples frameworks de seguridad.', 10, ARRAY['Cybersecurity', 'Ethical Hacking', 'Network Security', 'CISSP', 'Penetration Testing'], 0, 1),

('ana.lopez@eduplus.com', '$2b$10$example_hash_4', 'Ana', 'López', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', '+34-600-456-789', 'España', 'Sevilla', 'instructor', 'active', true, true, 'Data Scientist con experiencia en machine learning y análisis predictivo.', true, 'Especialista en Python, R, y herramientas de Big Data. He desarrollado modelos de ML para empresas de e-commerce y fintech.', 7, ARRAY['Data Science', 'Machine Learning', 'Python', 'R', 'Big Data', 'TensorFlow'], 0, 1),

-- Estudiantes
('juan.perez@student.com', '$2b$10$example_hash_5', 'Juan', 'Pérez', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+34-600-567-890', 'España', 'Madrid', 'student', 'active', true, true, 'Estudiante de ingeniería informática interesado en desarrollo web.', false, null, null, null, 1250, 3),

('laura.sanchez@student.com', '$2b$10$example_hash_6', 'Laura', 'Sánchez', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '+34-600-678-901', 'España', 'Barcelona', 'student', 'active', true, true, 'Diseñadora gráfica que quiere especializarse en UX/UI.', false, null, null, null, 890, 2),

('miguel.torres@student.com', '$2b$10$example_hash_7', 'Miguel', 'Torres', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150', '+34-600-789-012', 'España', 'Valencia', 'student', 'active', true, true, 'Profesional de IT buscando especializarse en ciberseguridad.', false, null, null, null, 2100, 4),

('sofia.ruiz@student.com', '$2b$10$example_hash_8', 'Sofía', 'Ruiz', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150', '+34-600-890-123', 'España', 'Sevilla', 'student', 'active', true, true, 'Analista de datos interesada en machine learning.', false, null, null, null, 1680, 3),

('pedro.garcia@student.com', '$2b$10$example_hash_9', 'Pedro', 'García', 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150', '+34-600-901-234', 'España', 'Bilbao', 'student', 'active', true, true, 'Emprendedor interesado en marketing digital.', false, null, null, null, 750, 2);

-- Insertar cursos
INSERT INTO courses (title, slug, description, short_description, instructor_id, category_id, level, price, thumbnail_url, preview_video_url, duration_hours, total_lessons, status, featured, requirements, what_you_learn, target_audience, rating, total_students, total_reviews) VALUES
('Desarrollo Web Full Stack con React y Node.js', 'desarrollo-web-full-stack-react-nodejs', 'Aprende a crear aplicaciones web completas desde cero utilizando las tecnologías más demandadas del mercado: React para el frontend y Node.js para el backend. Este curso te llevará desde los conceptos básicos hasta el desarrollo de aplicaciones complejas con autenticación, bases de datos y despliegue en la nube.', 'Domina React y Node.js para convertirte en un desarrollador Full Stack profesional', 1, 1, 'intermediate', 89.99, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 45, 120, 'published', true, ARRAY['Conocimientos básicos de HTML, CSS y JavaScript', 'Familiaridad con la terminal/línea de comandos', 'Ganas de aprender y dedicar tiempo al curso'], ARRAY['Crear aplicaciones web completas con React y Node.js', 'Implementar autenticación y autorización', 'Trabajar con bases de datos MongoDB', 'Desplegar aplicaciones en servicios cloud', 'Aplicar mejores prácticas de desarrollo'], ARRAY['Desarrolladores junior que quieren especializarse', 'Estudiantes de informática', 'Profesionales que quieren cambiar de carrera'], 4.7, 1250, 89),

('Diseño UX/UI Profesional con Figma', 'diseno-ux-ui-profesional-figma', 'Conviértete en un diseñador UX/UI profesional aprendiendo metodologías de diseño centrado en el usuario, prototipado avanzado y el uso profesional de Figma. Incluye proyectos reales y portfolio profesional.', 'Aprende diseño UX/UI desde cero hasta nivel profesional con Figma', 2, 2, 'beginner', 79.99, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 35, 95, 'published', true, ARRAY['No se requiere experiencia previa en diseño', 'Computadora con acceso a internet', 'Cuenta gratuita de Figma'], ARRAY['Dominar los principios del diseño UX/UI', 'Crear prototipos interactivos en Figma', 'Realizar investigación de usuarios', 'Diseñar sistemas de diseño escalables', 'Construir un portfolio profesional'], ARRAY['Principiantes en diseño', 'Desarrolladores que quieren aprender diseño', 'Profesionales que buscan cambio de carrera'], 4.8, 890, 67),

('Ciberseguridad Ética y Pentesting', 'ciberseguridad-etica-pentesting', 'Aprende las técnicas y herramientas utilizadas por los profesionales de la ciberseguridad para proteger sistemas y redes. Incluye laboratorios prácticos de pentesting ético y preparación para certificaciones.', 'Conviértete en un experto en ciberseguridad ética y pentesting', 3, 5, 'advanced', 129.99, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 60, 150, 'published', true, ARRAY['Conocimientos básicos de redes', 'Experiencia con sistemas Linux', 'Comprensión de protocolos de red'], ARRAY['Realizar auditorías de seguridad profesionales', 'Usar herramientas de pentesting como Metasploit, Nmap, Burp Suite', 'Identificar y explotar vulnerabilidades de forma ética', 'Crear reportes profesionales de seguridad', 'Prepararse para certificaciones CEH y OSCP'], ARRAY['Profesionales de IT', 'Administradores de sistemas', 'Estudiantes de ciberseguridad'], 4.9, 650, 78),

('Machine Learning con Python', 'machine-learning-python', 'Domina el machine learning desde los fundamentos matemáticos hasta la implementación de algoritmos avanzados usando Python, scikit-learn, TensorFlow y Keras. Incluye proyectos reales con datasets del mundo real.', 'Aprende Machine Learning desde cero con Python y proyectos reales', 4, 4, 'intermediate', 99.99, 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 50, 130, 'published', true, ARRAY['Conocimientos de Python intermedio', 'Matemáticas básicas (álgebra y estadística)', 'Experiencia con Jupyter Notebooks'], ARRAY['Implementar algoritmos de ML desde cero', 'Usar librerías como scikit-learn, TensorFlow y Keras', 'Realizar análisis exploratorio de datos', 'Crear modelos predictivos para problemas reales', 'Evaluar y optimizar modelos de ML'], ARRAY['Data Scientists junior', 'Desarrolladores Python', 'Analistas de datos'], 4.6, 1100, 95),

('Marketing Digital Avanzado', 'marketing-digital-avanzado', 'Estrategias avanzadas de marketing digital incluyendo SEO, SEM, marketing de contenidos, redes sociales y analítica web. Aprende a crear campañas efectivas y medir su ROI.', 'Domina las estrategias de marketing digital más efectivas del mercado', 2, 3, 'intermediate', 69.99, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 30, 80, 'published', false, ARRAY['Conocimientos básicos de marketing', 'Familiaridad con redes sociales', 'Acceso a herramientas de Google'], ARRAY['Crear estrategias de marketing digital integrales', 'Optimizar campañas de Google Ads y Facebook Ads', 'Implementar SEO técnico y de contenidos', 'Analizar métricas y KPIs de marketing', 'Automatizar procesos de marketing'], ARRAY['Emprendedores', 'Profesionales de marketing', 'Dueños de pequeñas empresas'], 4.5, 780, 56),

('Desarrollo de APIs REST con Node.js', 'desarrollo-apis-rest-nodejs', 'Aprende a crear APIs REST robustas y escalables con Node.js, Express, MongoDB y mejores prácticas de seguridad. Incluye autenticación JWT, testing y documentación con Swagger.', 'Crea APIs profesionales con Node.js, Express y MongoDB', 1, 1, 'intermediate', 79.99, 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 25, 65, 'published', false, ARRAY['Conocimientos de JavaScript ES6+', 'Experiencia básica con Node.js', 'Familiaridad con bases de datos'], ARRAY['Diseñar y desarrollar APIs REST escalables', 'Implementar autenticación y autorización con JWT', 'Crear tests automatizados para APIs', 'Documentar APIs con Swagger/OpenAPI', 'Aplicar mejores prácticas de seguridad'], ARRAY['Desarrolladores backend', 'Desarrolladores full stack', 'Arquitectos de software'], 4.7, 920, 73),

('Análisis de Datos con Python y Pandas', 'analisis-datos-python-pandas', 'Domina el análisis de datos con Python usando pandas, numpy, matplotlib y seaborn. Aprende a limpiar, transformar y visualizar datos para tomar decisiones basadas en evidencia.', 'Conviértete en un analista de datos profesional con Python', 4, 4, 'beginner', 59.99, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 35, 90, 'published', false, ARRAY['Conocimientos básicos de Python', 'Matemáticas de nivel bachillerato', 'Curiosidad por los datos'], ARRAY['Manipular y limpiar datasets complejos', 'Crear visualizaciones impactantes', 'Realizar análisis estadístico descriptivo', 'Automatizar reportes con Python', 'Presentar insights de forma efectiva'], ARRAY['Analistas junior', 'Profesionales de negocios', 'Estudiantes de ciencias'], 4.4, 1350, 102),

('Certificación AWS Cloud Practitioner', 'certificacion-aws-cloud-practitioner', 'Prepárate para la certificación AWS Cloud Practitioner con contenido actualizado, laboratorios prácticos y exámenes de práctica. Aprende los fundamentos de la nube de AWS.', 'Obtén tu primera certificación AWS con este curso completo', 3, 5, 'beginner', 89.99, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 40, 110, 'published', true, ARRAY['Conocimientos básicos de IT', 'Familiaridad con conceptos de red', 'Ganas de aprender cloud computing'], ARRAY['Comprender los servicios principales de AWS', 'Dominar los modelos de precios de AWS', 'Implementar mejores prácticas de seguridad', 'Aprobar el examen AWS Cloud Practitioner', 'Planificar migraciones a la nube'], ARRAY['Profesionales de IT', 'Administradores de sistemas', 'Desarrolladores'], 4.8, 2100, 156);

-- Insertar secciones de cursos (ejemplo para el primer curso)
INSERT INTO course_sections (course_id, title, description, order_index) VALUES
(1, 'Introducción y Configuración del Entorno', 'Configuración del entorno de desarrollo y conceptos básicos', 1),
(1, 'Fundamentos de React', 'Componentes, JSX, Props y State', 2),
(1, 'React Hooks y Context API', 'useState, useEffect, useContext y hooks personalizados', 3),
(1, 'Fundamentos de Node.js', 'Servidor HTTP, módulos y npm', 4),
(1, 'Express.js y Middleware', 'Creación de APIs REST con Express', 5),
(1, 'Base de Datos MongoDB', 'Mongoose, esquemas y operaciones CRUD', 6),
(1, 'Autenticación y Autorización', 'JWT, bcrypt y middleware de autenticación', 7),
(1, 'Testing y Despliegue', 'Jest, testing de APIs y despliegue en Heroku', 8);

-- Insertar algunas lecciones de ejemplo
INSERT INTO course_lessons (section_id, course_id, title, description, content_type, duration_minutes, order_index, is_preview) VALUES
(1, 1, 'Bienvenida al curso', 'Introducción al curso y objetivos de aprendizaje', 'video', 15, 1, true),
(1, 1, 'Instalación de Node.js y npm', 'Configuración del entorno de desarrollo', 'video', 20, 2, true),
(1, 1, 'Configuración de VS Code', 'Extensiones y configuración recomendada', 'video', 12, 3, false),
(2, 1, 'Qué es React y por qué usarlo', 'Introducción a React y sus ventajas', 'video', 18, 1, false),
(2, 1, 'Creando tu primer componente', 'JSX y componentes funcionales', 'video', 25, 2, false),
(2, 1, 'Props y comunicación entre componentes', 'Pasando datos entre componentes', 'video', 22, 3, false);

-- Insertar inscripciones
INSERT INTO course_enrollments (user_id, course_id, progress_percentage, status, total_time_spent, payment_status, payment_amount) VALUES
(5, 1, 65.5, 'active', 1200, 'paid', 89.99),
(5, 2, 30.2, 'active', 450, 'paid', 79.99),
(6, 2, 85.7, 'active', 1800, 'paid', 79.99),
(6, 5, 45.3, 'active', 680, 'paid', 69.99),
(7, 3, 92.1, 'active', 3200, 'paid', 129.99),
(7, 8, 15.8, 'active', 320, 'paid', 89.99),
(8, 4, 78.4, 'active', 2100, 'paid', 99.99),
(8, 7, 55.6, 'active', 1100, 'paid', 59.99),
(9, 5, 25.7, 'active', 380, 'paid', 69.99),
(9, 1, 12.3, 'active', 180, 'paid', 89.99);

-- Insertar progreso de lecciones
INSERT INTO lesson_progress (user_id, course_id, lesson_id, status, time_spent, completed_at) VALUES
(5, 1, 1, 'completed', 15, NOW() - INTERVAL '10 days'),
(5, 1, 2, 'completed', 20, NOW() - INTERVAL '9 days'),
(5, 1, 3, 'completed', 12, NOW() - INTERVAL '8 days'),
(5, 1, 4, 'completed', 18, NOW() - INTERVAL '7 days'),
(5, 1, 5, 'in_progress', 12, null),
(6, 2, 1, 'completed', 15, NOW() - INTERVAL '15 days'),
(6, 2, 2, 'completed', 20, NOW() - INTERVAL '14 days'),
(7, 3, 1, 'completed', 15, NOW() - INTERVAL '20 days'),
(8, 4, 1, 'completed', 15, NOW() - INTERVAL '12 days');

-- Insertar reseñas
INSERT INTO course_reviews (user_id, course_id, rating, review_text) VALUES
(5, 1, 5, 'Excelente curso, muy completo y bien explicado. El instructor tiene mucha experiencia y se nota.'),
(6, 2, 5, 'Perfecto para aprender UX/UI desde cero. Los proyectos prácticos son muy útiles.'),
(7, 3, 5, 'El mejor curso de ciberseguridad que he tomado. Muy práctico y actualizado.'),
(8, 4, 4, 'Buen curso de ML, aunque algunos conceptos podrían explicarse mejor.'),
(9, 5, 4, 'Buena introducción al marketing digital, pero me hubiera gustado más contenido avanzado.');

-- Actualizar estadísticas de instructores
UPDATE users SET 
    instructor_total_students = (
        SELECT COUNT(DISTINCT ce.user_id) 
        FROM course_enrollments ce 
        JOIN courses c ON ce.course_id = c.id 
        WHERE c.instructor_id = users.id
    ),
    instructor_total_courses = (
        SELECT COUNT(*) 
        FROM courses 
        WHERE instructor_id = users.id AND status = 'published'
    ),
    instructor_total_reviews = (
        SELECT COUNT(*) 
        FROM course_reviews cr 
        JOIN courses c ON cr.course_id = c.id 
        WHERE c.instructor_id = users.id
    ),
    instructor_rating = (
        SELECT ROUND(AVG(cr.rating), 2) 
        FROM course_reviews cr 
        JOIN courses c ON cr.course_id = c.id 
        WHERE c.instructor_id = users.id
    )
WHERE role = 'instructor';

-- Actualizar estadísticas de cursos
UPDATE courses SET 
    total_students = (
        SELECT COUNT(*) 
        FROM course_enrollments 
        WHERE course_id = courses.id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM course_reviews 
        WHERE course_id = courses.id
    ),
    rating = (
        SELECT ROUND(AVG(rating), 2) 
        FROM course_reviews 
        WHERE course_id = courses.id
    );