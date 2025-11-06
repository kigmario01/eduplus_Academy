const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Crear evaluación con preguntas ABC y asignarla a un curso
router.post('/', requireAuth('teacher'), async (req, res) => {
  const { title, description, course_id, passing_score, questions } = req.body;
  if (!title || !course_id || !passing_score || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Parámetros inválidos (title, course_id, passing_score, questions[])' });
  }

  try {
    const client = await db.query('BEGIN');
    await db.query('COMMIT'); // NOOP for client; easier with simple queries below
  } catch {}

  try {
    const evalRes = await db.query(
      'INSERT INTO evaluations (title, description, course_id, passing_score, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, description || null, course_id, passing_score, req.user.id]
    );
    const evaluationId = evalRes.rows[0].id;

    for (const q of questions) {
      const { prompt, option_a, option_b, option_c, correct_option } = q;
      if (!prompt || !option_a || !option_b || !option_c || !['A', 'B', 'C'].includes(correct_option)) {
        return res.status(400).json({ error: 'Pregunta inválida: prompt, opciones A/B/C y correct_option en {A,B,C}' });
      }
      await db.query(
        'INSERT INTO evaluation_questions (evaluation_id, prompt, option_a, option_b, option_c, correct_option) VALUES ($1, $2, $3, $4, $5, $6)',
        [evaluationId, prompt, option_a, option_b, option_c, correct_option]
      );
    }

    // Asignación activa al curso
    await db.query(
      'INSERT INTO evaluation_assignments (evaluation_id, course_id, active) VALUES ($1, $2, $3)',
      [evaluationId, course_id, true]
    );

    return res.status(201).json({ id: evaluationId });
  } catch (e) {
    console.error('Error creando evaluación:', e);
    return res.status(500).json({ error: 'Error interno al crear evaluación' });
  }
});

// Asignar evaluación a curso específico
router.post('/:id/assign', requireAuth('teacher'), async (req, res) => {
  const { id } = req.params;
  const { course_id, active } = req.body;
  if (!course_id) return res.status(400).json({ error: 'course_id requerido' });
  try {
    await db.query(
      'INSERT INTO evaluation_assignments (evaluation_id, course_id, active) VALUES ($1, $2, $3)',
      [id, course_id, active === false ? false : true]
    );
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('Error asignando evaluación:', e);
    return res.status(500).json({ error: 'Error interno al asignar evaluación' });
  }
});

// Listar evaluaciones por curso o por docente
router.get('/', requireAuth('teacher'), async (req, res) => {
  const { course_id } = req.query;
  try {
    if (course_id) {
      const r = await db.query(
        'SELECT e.* FROM evaluations e JOIN evaluation_assignments a ON a.evaluation_id = e.id WHERE a.course_id = $1 AND a.active = true',
        [course_id]
      );
      return res.json({ evaluations: r.rows });
    } else {
      const r = await db.query('SELECT * FROM evaluations WHERE created_by = $1 ORDER BY id DESC', [req.user.id]);
      return res.json({ evaluations: r.rows });
    }
  } catch (e) {
    console.error('Error listando evaluaciones:', e);
    return res.status(500).json({ error: 'Error interno al listar evaluaciones' });
  }
});

module.exports = router;