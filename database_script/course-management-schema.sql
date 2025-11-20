-- =====================================================
-- ESQUEMA DE GESTIÓN DE CURSOS Y MENSAJERÍA
-- EduPlus Academy - Sistema Completo
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLAS PARA GESTIÓN DE CURSOS
-- =====================================================

-- Tabla de categorías de cursos
CREATE TABLE IF NOT EXISTS course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES course_categories(id),
    level VARCHAR(50) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    language VARCHAR(10) DEFAULT 'es',
    price DECIMAL(10,2) DEFAULT 0,
    original_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    duration_hours INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    thumbnail_url VARCHAR(500),
    preview_video_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'suspended')),
    is_featured BOOLEAN DEFAULT false,
    requirements TEXT,
    what_you_learn TEXT,
    target_audience TEXT,
    tags TEXT[],
    enrollment_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de secciones de curso
CREATE TABLE IF NOT EXISTS course_sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    lesson_type VARCHAR(50) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment', 'live')),
    video_url VARCHAR(500),
    video_duration INTEGER DEFAULT 0, -- en segundos
    attachments JSONB,
    sort_order INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de recursos de curso
CREATE TABLE IF NOT EXISTS course_resources (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    is_downloadable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reseñas de cursos
CREATE TABLE IF NOT EXISTS course_reviews (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id)
);

-- Tabla de cupones y descuentos
CREATE TABLE IF NOT EXISTS course_coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SISTEMA DE MENSAJERÍA
-- =====================================================

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    title VARCHAR(255),
    conversation_type VARCHAR(50) DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'course_support')),
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de participantes en conversaciones
CREATE TABLE IF NOT EXISTS conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(conversation_id, user_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'video', 'audio')),
    attachments JSONB,
    reply_to_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estado de lectura de mensajes
CREATE TABLE IF NOT EXISTS message_read_status (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- =====================================================
-- TABLAS ADICIONALES PARA FUNCIONALIDADES AVANZADAS
-- =====================================================

-- Tabla de anuncios de curso
CREATE TABLE IF NOT EXISTS course_announcements (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de foros de curso
CREATE TABLE IF NOT EXISTS course_forums (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de temas del foro
CREATE TABLE IF NOT EXISTS forum_topics (
    id SERIAL PRIMARY KEY,
    forum_id INTEGER REFERENCES course_forums(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de respuestas del foro
CREATE TABLE IF NOT EXISTS forum_replies (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to_id INTEGER REFERENCES forum_replies(id) ON DELETE SET NULL,
    is_solution BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para cursos
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_published_at ON courses(published_at);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Índices para lecciones
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_section_id ON course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_sort_order ON course_lessons(sort_order);

-- Índices para mensajería
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas de curso
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar conteo de inscripciones
    UPDATE courses 
    SET enrollment_count = (
        SELECT COUNT(*) 
        FROM course_enrollments 
        WHERE course_id = NEW.course_id AND status = 'active'
    )
    WHERE id = NEW.course_id;
    
    -- Actualizar rating promedio
    UPDATE courses 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM course_reviews 
            WHERE course_id = NEW.course_id
        )
    WHERE id = NEW.course_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para estadísticas
CREATE TRIGGER update_course_enrollment_stats 
    AFTER INSERT OR UPDATE OR DELETE ON course_enrollments 
    FOR EACH ROW EXECUTE FUNCTION update_course_stats();

CREATE TRIGGER update_course_review_stats 
    AFTER INSERT OR UPDATE OR DELETE ON course_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_course_stats();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de estadísticas de instructor
CREATE OR REPLACE VIEW instructor_stats AS
SELECT 
    u.id as instructor_id,
    u.name,
    u.lastname,
    COUNT(DISTINCT c.id) as total_courses,
    COUNT(DISTINCT ce.user_id) as total_students,
    COALESCE(SUM(c.price * ce_count.enrollment_count), 0) as total_revenue,
    COALESCE(AVG(c.average_rating), 0) as average_rating,
    COUNT(DISTINCT cr.id) as total_reviews
FROM users u
LEFT JOIN courses c ON u.id = c.instructor_id AND c.status = 'published'
LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.status = 'active'
LEFT JOIN course_reviews cr ON c.id = cr.course_id
LEFT JOIN (
    SELECT course_id, COUNT(*) as enrollment_count
    FROM course_enrollments 
    WHERE status = 'active'
    GROUP BY course_id
) ce_count ON c.id = ce_count.course_id
WHERE u.role = 'instructor'
GROUP BY u.id, u.name, u.lastname;

-- Vista de progreso de curso
CREATE OR REPLACE VIEW course_progress_summary AS
SELECT 
    c.id as course_id,
    c.title,
    c.instructor_id,
    COUNT(DISTINCT ce.user_id) as enrolled_students,
    COUNT(DISTINCT CASE WHEN ce.status = 'completed' THEN ce.user_id END) as completed_students,
    ROUND(
        (COUNT(CASE WHEN ce.status = 'completed' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(ce.id), 0), 2
    ) as completion_rate,
    AVG(ce.progress) as average_progress
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
WHERE c.status = 'published'
GROUP BY c.id, c.title, c.instructor_id;

-- Vista de conversaciones activas
CREATE OR REPLACE VIEW active_conversations AS
SELECT 
    c.id,
    c.uuid,
    c.title,
    c.conversation_type,
    c.course_id,
    co.title as course_title,
    c.created_by,
    u.name as created_by_name,
    c.last_message_at,
    COUNT(DISTINCT cp.user_id) as participant_count,
    COUNT(DISTINCT m.id) as message_count
FROM conversations c
LEFT JOIN courses co ON c.course_id = co.id
LEFT JOIN users u ON c.created_by = u.id
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN messages m ON c.id = m.conversation_id AND m.is_deleted = false
WHERE c.is_active = true
GROUP BY c.id, c.uuid, c.title, c.conversation_type, c.course_id, co.title, c.created_by, u.name, c.last_message_at;