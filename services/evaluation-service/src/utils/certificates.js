const { v4: uuidv4 } = require('uuid');

function generateCertificateCode() {
  return uuidv4();
}

function buildCertificatePayload({ studentId, studentName, courseId, courseTitle, evaluationId, score }) {
  return {
    issued_at: new Date().toISOString(),
    student_id: studentId,
    student_name: studentName,
    course_id: courseId,
    course_title: courseTitle,
    evaluation_id: evaluationId,
    score,
    message: 'Certificado de aprobación generado automáticamente.'
  };
}

module.exports = { generateCertificateCode, buildCertificatePayload };