const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const router = express.Router();

// Listar certificados del estudiante autenticado
router.get('/certificates/me', requireAuth('student'), async (req, res) => {
  try {
    const r = await db.query(
      'SELECT id, evaluation_id, student_id, certificate_code, payload, created_at FROM evaluation_certificates WHERE student_id = $1 ORDER BY id DESC',
      [req.user.id]
    );
    const items = r.rows.map((row) => ({
      id: row.id,
      evaluation_id: row.evaluation_id,
      student_id: row.student_id,
      code: row.certificate_code,
      payload: safeParseJson(row.payload),
      created_at: row.created_at || null,
    }));
    return res.json({ certificates: items });
  } catch (e) {
    console.error('Error listando certificados:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Verificar certificado por código (público)
router.get('/certificates/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const r = await db.query(
      'SELECT certificate_code, payload, created_at FROM evaluation_certificates WHERE certificate_code = $1 LIMIT 1',
      [code]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Certificado no encontrado' });
    const row = r.rows[0];
    const payload = safeParseJson(row.payload);
    return res.json({
      code: row.certificate_code,
      issued_at: payload?.issued_at || row.created_at || null,
      student_name: payload?.student_name || null,
      course_title: payload?.course_title || null,
      score: payload?.score ?? null,
      passed: (payload?.score ?? 0) >= 0 ? true : undefined,
      payload,
    });
  } catch (e) {
    console.error('Error verificando certificado:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Descargar certificado en PDF (placeholder)
router.get('/certificates/:id/pdf', requireAuth('student'), async (req, res) => {
  const { id } = req.params;
  try {
    const r = await db.query(
      'SELECT id, student_id, certificate_code, payload, created_at FROM evaluation_certificates WHERE id = $1',
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Certificado no encontrado' });
    const cert = r.rows[0];
    if (String(cert.student_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payload = safeParseJson(cert.payload) || {};

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const title = 'Certificado de Finalización';
    const studentName = payload?.student?.name || payload?.student_name || 'Estudiante';
    const courseTitle = payload?.course?.title || payload?.course_title || 'Curso';
    const code = cert.certificate_code;
    const date = new Date(cert.created_at || Date.now()).toLocaleDateString('es-ES');

    page.setFont(font);
    page.setFontSize(28);
    page.drawText(title, { x: 80, y: 760, color: rgb(0.2, 0.2, 0.2) });

    page.setFontSize(16);
    page.drawText(`Otorgado a: ${studentName}`, { x: 80, y: 700 });
    page.drawText(`Por completar: ${courseTitle}`, { x: 80, y: 670 });
    page.drawText(`Fecha: ${date}`, { x: 80, y: 640 });
    page.drawText(`Código de verificación: ${code}`, { x: 80, y: 610 });

    page.setFontSize(12);
    page.drawText('Verifica este certificado en: /api/evaluations/certificates/:code', { x: 80, y: 560, color: rgb(0.3, 0.3, 0.3) });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${code}.pdf"`);
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (e) {
    console.error('Error generando PDF de certificado:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

module.exports = router;