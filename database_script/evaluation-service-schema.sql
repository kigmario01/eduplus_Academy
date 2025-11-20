-- Esquema de base de datos para microservicio de evaluaciones (ABC)

CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_questions (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C'))
);

CREATE TABLE IF NOT EXISTS evaluation_assignments (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_attempts (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_certificates (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL,
  certificate_code TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(64) NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_assignments_course ON evaluation_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_eval_attempts_student ON evaluation_attempts(student_id);