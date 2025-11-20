// Utilidades para evaluación
// Funciones puras para cálculo y validación

export function calculateScore(correct = [], student = []) {
  let score = 0;
  for (let i = 0; i < Math.min(correct.length, student.length); i++) {
    if (correct[i] === student[i]) score++;
  }
  return score;
}

export function validateAnswers(questions = [], answers = []) {
  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    return { valid: false, error: 'Parámetros inválidos' };
  }
  if (questions.length !== answers.length) {
    return { valid: false, error: 'Número de respuestas incorrecto' };
  }
  return { valid: true };
}