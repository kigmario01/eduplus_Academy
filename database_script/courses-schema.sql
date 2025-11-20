-- Schema para sistema de gestión de cursos EduPlus Academy
-- Inspirado en plataformas como Udemy y Cisco

-- Tabla de categorías de cursos
CREATE TABLE IF NOT EXISTS course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Color hex
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    requirements TEXT[], -- Array de requisitos
    what_you_learn TEXT[], -- Array de lo que aprenderás
    target_audience TEXT[], -- Array de audiencia objetivo
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_students INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Tabla de secciones del curso
CREATE TABLE IF NOT EXISTS course_sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_type VARCHAR(20) CHECK (content_type IN ('video', 'text', 'quiz', 'assignment', 'download')) NOT NULL,
    content_url VARCHAR(500), -- URL del video, archivo, etc.
    content_text TEXT, -- Contenido de texto
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE, -- Si es una lección de vista previa gratuita
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de recursos descargables
CREATE TABLE IF NOT EXISTS lesson_resources (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- pdf, zip, doc, etc.
    file_size INTEGER, -- en bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de quizzes
CREATE TABLE IF NOT EXISTS course_quizzes (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70, -- Porcentaje mínimo para aprobar
    time_limit_minutes INTEGER, -- NULL = sin límite de tiempo
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas de quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES course_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')) NOT NULL,
    options JSONB, -- Para opciones múltiples: {"a": "opción 1", "b": "opción 2", ...}
    correct_answer VARCHAR(500) NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones a cursos
CREATE TABLE IF NOT EXISTS course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    UNIQUE(user_id, course_id)
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0, -- Para videos: último segundo visto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Tabla de resultados de quizzes
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES course_quizzes(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB, -- Respuestas del usuario
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    attempt_number INTEGER NOT NULL
);

-- Tabla de reseñas y calificaciones
CREATE TABLE IF NOT EXISTS course_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Tabla de certificados
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    verification_code VARCHAR(100) UNIQUE NOT NULL
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_section ON course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course ON course_reviews(course_id);

-- Insertar categorías por defecto
INSERT INTO course_categories (name, description, icon, color) VALUES
('Programación', 'Cursos de desarrollo de software y programación', 'code', '#3B82F6'),
('Diseño', 'Cursos de diseño gráfico, web y UX/UI', 'palette', '#8B5CF6'),
('Marketing', 'Cursos de marketing digital y estrategias de negocio', 'trending-up', '#10B981'),
('Datos', 'Cursos de análisis de datos, ciencia de datos y BI', 'bar-chart', '#F59E0B'),
('Redes', 'Cursos de redes, ciberseguridad y administración de sistemas', 'shield', '#EF4444'),
('Negocios', 'Cursos de administración, liderazgo y emprendimiento', 'briefcase', '#6366F1'),
('Idiomas', 'Cursos de idiomas y comunicación', 'globe', '#EC4899'),
('Certificaciones', 'Preparación para certificaciones profesionales', 'award', '#F97316')
ON CONFLICT (name) DO NOTHING;