/**
 * Validador de texto para el frontend
 */
export const textValidator = {
  /**
   * Valida el contenido de texto (material complementario)
   * @param {string} text - Texto a validar
   * @returns {Object} - Resultado de validación
   */
  validate(text) {
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
  },

  /**
   * Valida el formato de texto enriquecido (Markdown/HTML básico)
   * @param {string} text - Texto a validar
   * @returns {Object} - Resultado de validación
   */
  validateRichText(text) {
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
  },

  /**
   * Sanitiza el texto removiendo contenido peligroso
   * @param {string} text - Texto a sanitizar
   * @returns {string} - Texto sanitizado
   */
  sanitize(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Remover scripts y event handlers peligrosos
    let sanitized = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:\s*text\/html/gi, '');

    return sanitized;
  }
};