const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { generateCertificateCode, buildCertificatePayload } = require('../utils/certificates');
const { notifyUser } = require('../utils/notifications');

const router = express.Router();

// Obtener evaluación por curso (si hay asignación activa)
router.get('/by-course/:courseId', requireAuth('student'), async (req, res) => {
  const { courseId } = req.params;
  try {
    const r = await db.query(
      'SELECT e.* FROM evaluations e JOIN evaluation_assignments a ON a.evaluation_id = e.id WHERE a.course_id = $1 AND a.active = true LIMIT 1',
      [courseId]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'No hay evaluación asignada al curso' });
    const evalRow = r.rows[0];
    return res.json({ evaluation: evalRow });
  } catch (e) {
    console.error('Error obteniendo evaluación por curso:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener preguntas de una evaluación (sin revelar respuestas correctas)
router.get('/:id', requireAuth('student'), async (req, res) => {
  const { id } = req.params;
  try {
    const evalRes = await db.query('SELECT * FROM evaluations WHERE id = $1', [id]);
    if (evalRes.rows.length === 0) return res.status(404).json({ error: 'Evaluación no encontrada' });
    const qRes = await db.query(
      'SELECT id, prompt, option_a, option_b, option_c FROM evaluation_questions WHERE evaluation_id = $1 ORDER BY id ASC',
      [id]
    );
    return res.json({ evaluation: evalRes.rows[0], questions: qRes.rows });
  } catch (e) {
    console.error('Error obteniendo preguntas:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Enviar respuestas, validar y calcular puntaje; generar certificado si aprueba
router.post('/:id/submit', requireAuth('student'), async (req, res) => {
  const { id } = req.params; // evaluation_id
  const { answers } = req.body; // [{ question_id, answer: 'A'|'B'|'C' }]
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers[] requerido' });
  }
  try {
    const evalRes = await db.query('SELECT * FROM evaluations WHERE id = $1', [id]);
    if (evalRes.rows.length === 0) return res.status(404).json({ error: 'Evaluación no encontrada' });
    const evaluation = evalRes.rows[0];

    const qRes = await db.query(
      'SELECT id, correct_option FROM evaluation_questions WHERE evaluation_id = $1',
      [id]
    );
    const correctMap = new Map(qRes.rows.map(r => [String(r.id), r.correct_option]));
    let score = 0;
    for (const a of answers) {
      const qid = String(a.question_id);
      const correct = correctMap.get(qid);
      if (correct && a.answer === correct) score += 1;
    }
    const passed = score >= evaluation.passing_score;

    const attemptRes = await db.query(
      'INSERT INTO evaluation_attempts (evaluation_id, student_id, answers, score, passed, submitted_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      [id, req.user.id, JSON.stringify(answers), score, passed]
    );

    let certificate = null;
    if (passed) {
      const code = generateCertificateCode();
      const payload = buildCertificatePayload({
        studentId: req.user.id,
        studentName: req.user.name || '',
        courseId: evaluation.course_id,
        courseTitle: evaluation.title || 'Curso',
        evaluationId: id,
        score,
      });

      const certRes = await db.query(
        'INSERT INTO evaluation_certificates (evaluation_id, student_id, certificate_code, payload) VALUES ($1, $2, $3, $4) RETURNING id, certificate_code',
        [id, req.user.id, code, JSON.stringify(payload)]
      );
      certificate = { id: certRes.rows[0].id, code: certRes.rows[0].certificate_code };

      // Notificar al estudiante
      await notifyUser({ userId: req.user.id, type: 'evaluation.completed', payload: { evaluation_id: id, passed, score, certificate } });
    }

    return res.status(201).json({ attempt_id: attemptRes.rows[0].id, score, passed, certificate });
  } catch (e) {
    console.error('Error al enviar respuestas:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;