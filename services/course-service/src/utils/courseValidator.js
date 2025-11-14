/**
 * Validador de cursos y certificaciones
 * Valida requisitos y criterios de certificación
 */
export class CourseValidator {
  /**
   * Requisitos mínimos para certificación
   */
  static get CERTIFICATION_REQUIREMENTS() {
    return {
      MINIMUM_SCORE: 70, // Porcentaje mínimo para aprobar
      MINIMUM_COMPLETION: 80, // Porcentaje mínimo de completitud del curso
      MINIMUM_TIME_MINUTES: 30, // Tiempo mínimo para completar (30 minutos)
      MINIMUM_LESSONS: 3, // Mínimo de lecciones en el curso
      MINIMUM_EXAM_QUESTIONS: 10 // Mínimo de preguntas en el examen final
    };
  }

  /**
   * Genera un slug único para el curso
   * @param {string} title - Título del curso
   * @returns {string} - Slug generado
   */
  static generateSlug(title) {
    if (!title || typeof title !== 'string') {
      return 'curso-sin-titulo';
    }

    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/--+/g, '-') // Reemplazar múltiples guiones con uno solo
      .substring(0, 200); // Limitar longitud
  }

  /**
   * Valida que el slug no exista en la base de datos
   * @param {string} slug - Slug a validar
   * @param {Object} db - Conexión a la base de datos
   * @returns {Promise<boolean>} - true si está disponible, false si existe
   */
  static async isSlugAvailable(slug, db) {
    try {
      const result = await db.query(
        'SELECT id FROM courses WHERE slug = $1',
        [slug]
      );
      return result.rows.length === 0;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  }

  /**
   * Valida el contenido de texto (material complementario)
   * @param {string} text - Texto a validar
   * @returns {Object} - Resultado de validación
   */
  static validateTextContent(text) {
    if (!text || typeof text !== 'string') {
      return {
        isValid: false,
        error: 'El texto es requerido'
      };
    }

    const trimmedText = text.trim();

    if (trimmedText.length < 10) {
      return {
        isValid: false,
        error: 'El texto debe tener al menos 10 caracteres'
      };
    }

    if (trimmedText.length > 50000) {
      return {
        isValid: false,
        error: 'El texto no puede exceder 50000 caracteres'
      };
    }

    // Validar formato básico (no HTML malicioso)
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:\s*text\/html/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmedText)) {
        return {
          isValid: false,
          error: 'El texto contiene contenido potencialmente peligroso'
        };
      }
    }

    // Permitir HTML básico y Markdown
    const allowedTags = [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table', 'thead',
      'tbody', 'tr', 'td', 'th', 'div', 'span'
    ];

    return {
      isValid: true,
      error: null,
      wordCount: trimmedText.split(/\s+/).length,
      characterCount: trimmedText.length
    };
  }

  /**
   * Valida los requisitos de certificación
   * @param {number} courseId - ID del curso
   * @param {Object} requirements - Requisitos de certificación
   * @param {Object} db - Conexión a la base de datos
   * @returns {Promise<Object>} - Resultado de validación
   */
  static async validateCertificationRequirements(courseId, requirements, db) {
    const errors = [];
    const minReq = this.CERTIFICATION_REQUIREMENTS;

    try {
      // Verificar que el curso existe y tiene suficientes lecciones
      const courseResult = await db.query(`
        SELECT 
          c.id,
          c.title,
          COUNT(DISTINCT cs.id) as section_count,
          COUNT(DISTINCT cl.id) as lesson_count,
          SUM(cl.duration_minutes) as total_duration
        FROM courses c
        LEFT JOIN course_sections cs ON c.id = cs.course_id
        LEFT JOIN course_lessons cl ON cs.id = cl.section_id
        WHERE c.id = $1
        GROUP BY c.id, c.title
      `, [courseId]);

      if (courseResult.rows.length === 0) {
        errors.push('El curso no existe');
        return { isValid: false, errors };
      }

      const course = courseResult.rows[0];

      // Validar número mínimo de lecciones
      if (parseInt(course.lesson_count) < minReq.MINIMUM_LESSONS) {
        errors.push(`El curso debe tener al menos ${minReq.MINIMUM_LESSONS} lecciones (actual: ${course.lesson_count})`);
      }

      // Validar duración mínima
      const totalDuration = parseInt(course.total_duration) || 0;
      if (totalDuration < minReq.MINIMUM_TIME_MINUTES) {
        errors.push(`El curso debe tener al menos ${minReq.MINIMUM_TIME_MINUTES} minutos de duración total (actual: ${totalDuration} minutos)`);
      }

      // Validar requisitos de certificación
      if (requirements) {
        // Validar puntuación mínima
        if (requirements.minimum_score < minReq.MINIMUM_SCORE) {
          errors.push(`La puntuación mínima debe ser al menos ${minReq.MINIMUM_SCORE}% (actual: ${requirements.minimum_score}%)`);
        }

        // Validar porcentaje de completitud
        if (requirements.completion_percentage < minReq.MINIMUM_COMPLETION) {
          errors.push(`El porcentaje de completitud debe ser al menos ${minReq.MINIMUM_COMPLETION}% (actual: ${requirements.completion_percentage}%)`);
        }

        // Validar límite de tiempo si existe
        if (requirements.time_limit_minutes) {
          if (requirements.time_limit_minutes < minReq.MINIMUM_TIME_MINUTES) {
            errors.push(`El límite de tiempo debe ser al menos ${minReq.MINIMUM_TIME_MINUTES} minutos (actual: ${requirements.time_limit_minutes} minutos)`);
          }
          if (requirements.time_limit_minutes > totalDuration) {
            errors.push(`El límite de tiempo no puede exceder la duración total del curso (${totalDuration} minutos)`);
          }
        }
      }

      // Verificar que exista un examen final
      const examResult = await db.query(`
        SELECT 
          e.id,
          COUNT(eq.id) as question_count
        FROM evaluations e
        LEFT JOIN evaluation_questions eq ON e.id = eq.evaluation_id
        WHERE e.course_id = $1
        GROUP BY e.id
      `, [courseId]);

      if (examResult.rows.length === 0) {
        errors.push('El curso debe tener un examen final');
      } else {
        const exam = examResult.rows[0];
        if (parseInt(exam.question_count) < minReq.MINIMUM_EXAM_QUESTIONS) {
          errors.push(`El examen final debe tener al menos ${minReq.MINIMUM_EXAM_QUESTIONS} preguntas (actual: ${exam.question_count})`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors,
        courseInfo: {
          lessonCount: parseInt(course.lesson_count),
          totalDuration: totalDuration,
          hasExam: examResult.rows.length > 0
        }
      };

    } catch (error) {
      console.error('Error validating certification requirements:', error);
      return {
        isValid: false,
        errors: ['Error al validar los requisitos de certificación']
      };
    }
  }

  /**
   * Valida un examen completo
   * @param {Object} examData - Datos del examen
   * @returns {Object} - Resultado de validación
   */
  static validateExam(examData) {
    const errors = [];
    const minReq = this.CERTIFICATION_REQUIREMENTS;

    if (!examData.questions || !Array.isArray(examData.questions)) {
      errors.push('El examen debe tener preguntas');
      return { isValid: false, errors };
    }

    if (examData.questions.length < minReq.MINIMUM_EXAM_QUESTIONS) {
      errors.push(`El examen debe tener al menos ${minReq.MINIMUM_EXAM_QUESTIONS} preguntas`);
    }

    // Validar cada pregunta
    examData.questions.forEach((question, index) => {
      if (!question.prompt || question.prompt.trim().length < 10) {
        errors.push(`La pregunta ${index + 1} debe tener al menos 10 caracteres`);
      }

      if (!question.option_a || question.option_a.trim().length < 1) {
        errors.push(`La pregunta ${index + 1} debe tener la opción A`);
      }

      if (!question.option_b || question.option_b.trim().length < 1) {
        errors.push(`La pregunta ${index + 1} debe tener la opción B`);
      }

      if (!question.option_c || question.option_c.trim().length < 1) {
        errors.push(`La pregunta ${index + 1} debe tener la opción C`);
      }

      if (!question.correct_option || !['A', 'B', 'C'].includes(question.correct_option)) {
        errors.push(`La pregunta ${index + 1} debe tener una respuesta correcta válida (A, B o C)`);
      }
    });

    // Validar que la puntuación de aprobación sea razonable
    if (examData.passing_score < 50 || examData.passing_score > 95) {
      errors.push('La puntuación de aprobación debe estar entre 50% y 95%');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Valida el formato de texto enriquecido (Markdown/HTML básico)
   * @param {string} text - Texto a validar
   * @returns {Object} - Resultado de validación
   */
  static validateRichText(text) {
    if (!text || typeof text !== 'string') {
      return {
        isValid: false,
        error: 'El texto es requerido'
      };
    }

    const trimmedText = text.trim();

    // Validar longitud
    if (trimmedText.length < 10) {
      return {
        isValid: false,
        error: 'El texto debe tener al menos 10 caracteres'
      };
    }

    if (trimmedText.length > 50000) {
      return {
        isValid: false,
        error: 'El texto no puede exceder 50000 caracteres'
      };
    }

    // Validar estructura de Markdown básico
    const markdownPatterns = {
      headers: /^#{1,6}\s+/m,
      bold: /\*\*[^*]+\*\*/g,
      italic: /\*[^*]+\*/g,
      lists: /^[\s]*[-*+]\s+/m,
      links: /\[([^\]]+)\]\(([^)]+)\)/g,
      code: /`[^`]+`/g,
      codeBlocks: /```[\s\S]*?```/g
    };

    const hasMarkdown = Object.values(markdownPatterns).some(pattern => pattern.test(trimmedText));

    // Validar HTML básico permitido
    const allowedHtmlTags = [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table', 'thead',
      'tbody', 'tr', 'td', 'th', 'div', 'span'
    ];

    // Verificar que no haya scripts o contenido malicioso
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:\s*text\/html/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmedText)) {
        return {
          isValid: false,
          error: 'El texto contiene contenido potencialmente peligroso'
        };
      }
    }

    return {
      isValid: true,
      error: null,
      hasMarkdown,
      wordCount: trimmedText.split(/\s+/).length,
      characterCount: trimmedText.length
    };
  }
}