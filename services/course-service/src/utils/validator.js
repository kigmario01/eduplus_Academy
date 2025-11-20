// Validador de datos para cursos
// Retorna { valid: boolean, errors?: string[] }

export function validateCourseData(data = {}) {
  const errors = [];

  if (!data.name || String(data.name).trim() === '') {
    errors.push('El nombre es obligatorio');
  }
  if (!data.description || String(data.description).trim() === '') {
    errors.push('La descripción es obligatoria');
  }
  if (!data.teacherId || String(data.teacherId).trim() === '') {
    errors.push('El teacherId es obligatorio');
  }

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors };
}