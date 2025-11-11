/**
 * Validador de URLs de YouTube
 * Valida formatos de URLs de YouTube y extrae información
 */
export class YouTubeValidator {
  /**
   * Patrones de URLs de YouTube válidas
   */
  static get YOUTUBE_PATTERNS() {
    return [
      // youtu.be/VIDEO_ID
      /^https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
      // youtube.com/watch?v=VIDEO_ID
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/,
      // youtube.com/embed/VIDEO_ID
      /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
      // youtube.com/v/VIDEO_ID
      /^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
      // youtube.com/shorts/VIDEO_ID
      /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/
    ];
  }

  /**
   * Valida una URL de YouTube
   * @param {string} url - URL a validar
   * @returns {Object} - { isValid: boolean, videoId: string|null, error: string|null }
   */
  static validate(url) {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        videoId: null,
        error: 'La URL es requerida'
      };
    }

    // Limpiar la URL
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      return {
        isValid: false,
        videoId: null,
        error: 'La URL no puede estar vacía'
      };
    }

    // Verificar que sea una URL válida
    try {
      new URL(trimmedUrl);
    } catch (error) {
      return {
        isValid: false,
        videoId: null,
        error: 'Formato de URL inválido'
      };
    }

    // Verificar que sea de YouTube
    const isYouTubeDomain = trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be');
    if (!isYouTubeDomain) {
      return {
        isValid: false,
        videoId: null,
        error: 'La URL debe ser de YouTube'
      };
    }

    // Verificar contra los patrones
    for (const pattern of this.YOUTUBE_PATTERNS) {
      const match = trimmedUrl.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        
        // Validar que el ID del video tenga 11 caracteres
        if (videoId.length !== 11) {
          return {
            isValid: false,
            videoId: null,
            error: 'El ID del video debe tener 11 caracteres'
          };
        }

        // Validar que solo contenga caracteres válidos
        if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
          return {
            isValid: false,
            videoId: null,
            error: 'El ID del video contiene caracteres inválidos'
          };
        }

        return {
          isValid: true,
          videoId: videoId,
          error: null
        };
      }
    }

    return {
      isValid: false,
      videoId: null,
      error: 'Formato de URL de YouTube no reconocido'
    };
  }

  /**
   * Extrae el ID del video de una URL de YouTube
   * @param {string} url - URL de YouTube
   * @returns {string|null} - ID del video o null
   */
  static extractVideoId(url) {
    const validation = this.validate(url);
    return validation.videoId;
  }

  /**
   * Genera la URL embed de YouTube
   * @param {string} videoId - ID del video
   * @returns {string} - URL embed
   */
  static generateEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  /**
   * Genera la URL de miniatura de YouTube
   * @param {string} videoId - ID del video
   * @param {string} quality - calidad de la miniatura (default, mqdefault, hqdefault, maxresdefault)
   * @returns {string} - URL de la miniatura
   */
  static generateThumbnailUrl(videoId, quality = 'hqdefault') {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  }

  /**
   * Obtiene información del video (simulado - en producción usarías la API de YouTube)
   * @param {string} videoId - ID del video
   * @returns {Promise<Object>} - Información del video
   */
  static async getVideoInfo(videoId) {
    // En producción, aquí llamarías a la API de YouTube
    // Por ahora, retornamos datos simulados
    return {
      id: videoId,
      title: 'Video de YouTube',
      duration: 'PT10M30S', // ISO 8601 duration
      thumbnail: this.generateThumbnailUrl(videoId),
      embedUrl: this.generateEmbedUrl(videoId)
    };
  }

  /**
   * Valida múltiples URLs de YouTube
   * @param {string[]} urls - Array de URLs a validar
   * @returns {Object} - Resultados de validación
   */
  static validateMultiple(urls) {
    const results = [];
    let allValid = true;

    for (const url of urls) {
      const validation = this.validate(url);
      results.push({
        url,
        ...validation
      });
      
      if (!validation.isValid) {
        allValid = false;
      }
    }

    return {
      allValid,
      results
    };
  }
}