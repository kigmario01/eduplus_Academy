import Joi from 'joi';
import db from '../config/db.js';
import { YouTubeValidator } from '../utils/youtubeValidator.js';
import { CourseValidator } from '../utils/courseValidator.js';
import slugify from 'slugify';

// Esquema de validación para creación de cursos con YouTube
const courseCreationSchema = Joi.object({
  title: Joi.string().min(5).max(200).required()
    .messages({
      'string.min': 'El título debe tener al menos 5 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres',
      'string.empty': 'El título es requerido'
    }),
  description: Joi.string().min(50).max(5000).required()
    .messages({
      'string.min': 'La descripción debe tener al menos 50 caracteres',
      'string.max': 'La descripción no puede exceder 5000 caracteres',
      'string.empty': 'La descripción es requerida'
    }),
  short_description: Joi.string().max(500).optional().allow('')
    .messages({
      'string.max': 'La descripción corta no puede exceder 500 caracteres'
    }),
  category_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'La categoría debe ser un número válido',
      'number.positive': 'La categoría debe ser un ID válido',
      'any.required': 'La categoría es requerida'
    }),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required()
    .messages({
      'any.only': 'El nivel debe ser: principiante, intermedio o avanzado',
      'any.required': 'El nivel es requerido'
    }),
  // YouTube URL como contenido principal - requerido
  youtube_url: Joi.string().uri().required()
    .messages({
      'string.uri': 'Debe ingresar una URL válida de YouTube',
      'string.empty': 'El enlace de YouTube es requerido',
      'any.required': 'El enlace de YouTube es requerido'
    }),
  // Material complementario - texto plano, no archivos
  supplementary_material: Joi.string().max(10000).optional().allow('')
    .messages({
      'string.max': 'El material complementario no puede exceder 10000 caracteres'
    }),
  // Sin opción de subir archivos - solo URLs
  thumbnail_url: Joi.string().uri().optional().allow('')
    .messages({
      'string.uri': 'La URL de la miniatura debe ser válida'
    }),
  duration_hours: Joi.number().integer().min(1).max(200).required()
    .messages({
      'number.base': 'La duración debe ser un número entero',
      'number.min': 'La duración mínima es 1 hora',
      'number.max': 'La duración máxima es 200 horas',
      'any.required': 'La duración es requerida'
    }),
  language: Joi.string().length(2).default('es')
    .messages({
      'string.length': 'El idioma debe ser un código de 2 letras'
    }),
  requirements: Joi.array().items(Joi.string().max(500)).max(10).optional()
    .messages({
      'array.max': 'Máximo 10 requisitos permitidos',
      'string.max': 'Cada requisito no puede exceder 500 caracteres'
    }),
  what_you_learn: Joi.array().items(Joi.string().max(500)).max(15).optional()
    .messages({
      'array.max': 'Máximo 15 elementos de "qué aprenderás"',
      'string.max': 'Cada elemento no puede exceder 500 caracteres'
    }),
  target_audience: Joi.array().items(Joi.string().max(500)).max(10).optional()
    .messages({
      'array.max': 'Máximo 10 elementos de audiencia objetivo',
      'string.max': 'Cada elemento no puede exceder 500 caracteres'
    }),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional()
    .messages({
      'array.max': 'Máximo 20 etiquetas permitidas',
      'string.max': 'Cada etiqueta no puede exceder 50 caracteres'
    })
});

// Esquema para secciones del curso
const sectionSchema = Joi.object({
  title: Joi.string().min(3).max(200).required()
    .messages({
      'string.min': 'El título de la sección debe tener al menos 3 caracteres',
      'string.max': 'El título de la sección no puede exceder 200 caracteres'
    }),
  description: Joi.string().max(1000).optional().allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
  order_index: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'El orden debe ser un número entero',
      'number.min': 'El orden debe ser mayor o igual a 0'
    })
});

// Esquema para lecciones (sin archivos, solo YouTube y texto)
const lessonSchema = Joi.object({
  title: Joi.string().min(3).max(200).required()
    .messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 200 caracteres'
    }),
  description: Joi.string().max(1000).optional().allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
  // Solo YouTube y texto - sin archivos
  content_type: Joi.string().valid('video', 'text').required()
    .messages({
      'any.only': 'El tipo de contenido debe ser video o texto',
      'any.required': 'El tipo de contenido es requerido'
    }),
  // Para videos: URL de YouTube
  youtube_url: Joi.when('content_type', {
    is: 'video',
    then: Joi.string().uri().required()
      .messages({
        'string.uri': 'Debe ingresar una URL válida de YouTube',
        'any.required': 'El enlace de YouTube es requerido para videos'
      }),
    otherwise: Joi.optional().allow('')
  }),
  // Para texto: contenido en formato Markdown/HTML
  content_text: Joi.when('content_type', {
    is: 'text',
    then: Joi.string().min(10).max(50000).required()
      .messages({
        'string.min': 'El contenido de texto debe tener al menos 10 caracteres',
        'string.max': 'El contenido de texto no puede exceder 50000 caracteres',
        'any.required': 'El contenido de texto es requerido'
      }),
    otherwise: Joi.optional().allow('')
  }),
  duration_minutes: Joi.number().integer().min(1).max(300).required()
    .messages({
      'number.base': 'La duración debe ser un número entero',
      'number.min': 'La duración mínima es 1 minuto',
      'number.max': 'La duración máxima es 300 minutos',
      'any.required': 'La duración es requerida'
    }),
  order_index: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'El orden debe ser un número entero',
      'number.min': 'El orden debe ser mayor o igual a 0'
    }),
  is_preview: Joi.boolean().default(false),
  is_mandatory: Joi.boolean().default(true)
});

// Esquema para exámenes
const examSchema = Joi.object({
  title: Joi.string().min(5).max(200).required()
    .messages({
      'string.min': 'El título del examen debe tener al menos 5 caracteres',
      'string.max': 'El título del examen no puede exceder 200 caracteres'
    }),
  description: Joi.string().max(1000).optional().allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
  passing_score: Joi.number().integer().min(1).max(100).required()
    .messages({
      'number.base': 'La puntuación de aprobación debe ser un número entero',
      'number.min': 'La puntuación mínima es 1',
      'number.max': 'La puntuación máxima es 100',
      'any.required': 'La puntuación de aprobación es requerida'
    }),
  questions: Joi.array().items(
    Joi.object({
      prompt: Joi.string().min(10).max(1000).required()
        .messages({
          'string.min': 'La pregunta debe tener al menos 10 caracteres',
          'string.max': 'La pregunta no puede exceder 1000 caracteres',
          'any.required': 'El texto de la pregunta es requerido'
        }),
      option_a: Joi.string().min(1).max(500).required()
        .messages({
          'string.min': 'La opción A debe tener al menos 1 carácter',
          'string.max': 'La opción A no puede exceder 500 caracteres'
        }),
      option_b: Joi.string().min(1).max(500).required()
        .messages({
          'string.min': 'La opción B debe tener al menos 1 carácter',
          'string.max': 'La opción B no puede exceder 500 caracteres'
        }),
      option_c: Joi.string().min(1).max(500).required()
        .messages({
          'string.min': 'La opción C debe tener al menos 1 carácter',
          'string.max': 'La opción C no puede exceder 500 caracteres'
        }),
      correct_option: Joi.string().valid('A', 'B', 'C').required()
        .messages({
          'any.only': 'La respuesta correcta debe ser A, B o C',
          'any.required': 'Debe indicar la respuesta correcta'
        })
    })
  ).min(5).max(50).required()
    .messages({
      'array.min': 'El examen debe tener al menos 5 preguntas',
      'array.max': 'El examen no puede tener más de 50 preguntas',
      'any.required': 'Las preguntas son requeridas'
    })
});

// Esquema para certificaciones
const certificationSchema = Joi.object({
  title: Joi.string().min(5).max(200).required()
    .messages({
      'string.min': 'El título de la certificación debe tener al menos 5 caracteres',
      'string.max': 'El título de la certificación no puede exceder 200 caracteres'
    }),
  description: Joi.string().max(2000).optional().allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 2000 caracteres'
    }),
  requirements: Joi.object({
    minimum_score: Joi.number().integer().min(1).max(100).required()
      .messages({
        'number.base': 'La puntuación mínima debe ser un número entero',
        'number.min': 'La puntuación mínima es 1',
        'number.max': 'La puntuación máxima es 100',
        'any.required': 'La puntuación mínima es requerida'
      }),
    completion_percentage: Joi.number().integer().min(50).max(100).required()
      .messages({
        'number.base': 'El porcentaje de completitud debe ser un número entero',
        'number.min': 'El porcentaje mínimo es 50%',
        'number.max': 'El porcentaje máximo es 100%',
        'any.required': 'El porcentaje de completitud es requerido'
      }),
    time_limit_minutes: Joi.number().integer().min(30).max(300).optional()
      .messages({
        'number.base': 'El límite de tiempo debe ser un número entero',
        'number.min': 'El tiempo mínimo es 30 minutos',
        'number.max': 'El tiempo máximo es 300 minutos'
      })
  }).required()
    .messages({
      'any.required': 'Los requisitos de certificación son requeridos'
    })
});

export const courseCreationController = {
  // Crear curso completo con validaciones
  async createCourse(req, res) {
    try {
      const { error: courseError, value: courseData } = courseCreationSchema.validate(req.body);
      if (courseError) {
        return res.status(400).json({
          success: false,
          message: 'Datos del curso inválidos',
          errors: courseError.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Validar URL de YouTube
      const youtubeValidation = YouTubeValidator.validate(courseData.youtube_url);
      if (!youtubeValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'URL de YouTube inválida',
          errors: [{ field: 'youtube_url', message: youtubeValidation.error }]
        });
      }

      // Obtener instructor ID del usuario autenticado
      const instructorId = req.user?.id;
      if (!instructorId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que el usuario sea instructor
      const userCheck = await db.query(
        'SELECT role FROM users WHERE id = $1',
        [instructorId]
      );
      
      if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'instructor') {
        return res.status(403).json({
          success: false,
          message: 'Solo los instructores pueden crear cursos'
        });
      }

      // Verificar que la categoría exista
      const categoryCheck = await db.query(
        'SELECT id FROM course_categories WHERE id = $1 AND is_active = true',
        [courseData.category_id]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Categoría inválida o inactiva'
        });
      }

      // Generar slug único
      const slug = slugify(courseData.title, { lower: true, strict: true });
      
      // Verificar que el slug no exista
      const slugCheck = await db.query(
        'SELECT id FROM courses WHERE slug = $1',
        [slug]
      );
      
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un curso con un título similar'
        });
      }

      // Crear el curso
      const insertCourseQuery = `
        INSERT INTO courses (
          title, slug, description, short_description, instructor_id, category_id,
          level, language, duration_hours, preview_video_url, thumbnail_url,
          requirements, what_you_learn, target_audience, tags, status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'draft', NOW(), NOW())
        RETURNING id, uuid, title, slug, created_at
      `;

      const courseValues = [
        courseData.title,
        slug,
        courseData.description,
        courseData.short_description,
        instructorId,
        courseData.category_id,
        courseData.level,
        courseData.language,
        courseData.duration_hours,
        courseData.youtube_url, // Usar como preview_video_url
        courseData.thumbnail_url,
        JSON.stringify(courseData.requirements || []),
        JSON.stringify(courseData.what_you_learn || []),
        JSON.stringify(courseData.target_audience || []),
        JSON.stringify(courseData.tags || [])
      ];

      const courseResult = await db.query(insertCourseQuery, courseValues);
      const newCourse = courseResult.rows[0];

      // Guardar material complementario si existe
      if (courseData.supplementary_material) {
        await db.query(
          'UPDATE courses SET supplementary_material = $1 WHERE id = $2',
          [courseData.supplementary_material, newCourse.id]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Curso creado exitosamente',
        data: {
          id: newCourse.id,
          uuid: newCourse.uuid,
          title: newCourse.title,
          slug: newCourse.slug,
          created_at: newCourse.created_at
        }
      });

    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el curso',
        error: error.message
      });
    }
  },

  // Agregar sección al curso
  async addSection(req, res) {
    try {
      const { courseId } = req.params;
      const { error, value } = sectionSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de sección inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const instructorId = req.user?.id;
      
      // Verificar que el curso pertenezca al instructor
      const courseCheck = await db.query(
        'SELECT id FROM courses WHERE id = $1 AND instructor_id = $2',
        [courseId, instructorId]
      );
      
      if (courseCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este curso'
        });
      }

      const insertQuery = `
        INSERT INTO course_sections (course_id, title, description, order_index, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        courseId,
        value.title,
        value.description,
        value.order_index
      ]);

      res.status(201).json({
        success: true,
        message: 'Sección creada exitosamente',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating section:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la sección',
        error: error.message
      });
    }
  },

  // Agregar lección a la sección
  async addLesson(req, res) {
    try {
      const { sectionId } = req.params;
      const { error, value } = lessonSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de lección inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const instructorId = req.user?.id;
      
      // Verificar que la sección pertenezca a un curso del instructor
      const sectionCheck = await db.query(`
        SELECT cs.id, c.instructor_id 
        FROM course_sections cs 
        JOIN courses c ON cs.course_id = c.id 
        WHERE cs.id = $1 AND c.instructor_id = $2
      `, [sectionId, instructorId]);
      
      if (sectionCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar esta sección'
        });
      }

      // Validar URL de YouTube si es video
      if (value.content_type === 'video') {
        const youtubeValidation = YouTubeValidator.validate(value.youtube_url);
        if (!youtubeValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'URL de YouTube inválida',
            errors: [{ field: 'youtube_url', message: youtubeValidation.error }]
          });
        }
      }

      // Obtener course_id para la lección
      const courseResult = await db.query(
        'SELECT course_id FROM course_sections WHERE id = $1',
        [sectionId]
      );
      const courseId = courseResult.rows[0].course_id;

      const insertQuery = `
        INSERT INTO course_lessons (
          section_id, course_id, title, description, content_type, 
          content_url, content_text, duration_minutes, order_index, 
          is_preview, is_mandatory, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        sectionId,
        courseId,
        value.title,
        value.description,
        value.content_type,
        value.youtube_url || null, // content_url para videos
        value.content_text || null, // content_text para texto
        value.duration_minutes,
        value.order_index,
        value.is_preview,
        value.is_mandatory
      ]);

      res.status(201).json({
        success: true,
        message: 'Lección creada exitosamente',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la lección',
        error: error.message
      });
    }
  },

  // Crear examen para el curso
  async createExam(req, res) {
    try {
      const { courseId } = req.params;
      const { error, value } = examSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos del examen inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const instructorId = req.user?.id;
      
      // Verificar que el curso pertenezca al instructor
      const courseCheck = await db.query(
        'SELECT id FROM courses WHERE id = $1 AND instructor_id = $2',
        [courseId, instructorId]
      );
      
      if (courseCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear exámenes en este curso'
        });
      }

      const client = await db.pool.connect();
      
      try {
        await client.query('BEGIN');

        // Crear la evaluación
        const evaluationQuery = `
          INSERT INTO evaluations (title, description, course_id, passing_score, created_by, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING id
        `;

        const evaluationResult = await client.query(evaluationQuery, [
          value.title,
          value.description,
          courseId,
          value.passing_score,
          instructorId
        ]);

        const evaluationId = evaluationResult.rows[0].id;

        // Crear las preguntas
        const questionQuery = `
          INSERT INTO evaluation_questions (
            evaluation_id, prompt, option_a, option_b, option_c, correct_option
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        for (const question of value.questions) {
          await client.query(questionQuery, [
            evaluationId,
            question.prompt,
            question.option_a,
            question.option_b,
            question.option_c,
            question.correct_option
          ]);
        }

        // Asignar el examen al curso
        const assignmentQuery = `
          INSERT INTO evaluation_assignments (evaluation_id, course_id, active, assigned_at)
          VALUES ($1, $2, true, NOW())
        `;

        await client.query(assignmentQuery, [evaluationId, courseId]);

        await client.query('COMMIT');

        res.status(201).json({
          success: true,
          message: 'Examen creado exitosamente',
          data: { evaluation_id: evaluationId }
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Error creating exam:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el examen',
        error: error.message
      });
    }
  },

  // Crear certificación para el curso
  async createCertification(req, res) {
    try {
      const { courseId } = req.params;
      const { error, value } = certificationSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de certificación inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const instructorId = req.user?.id;
      
      // Verificar que el curso pertenezca al instructor
      const courseCheck = await db.query(
        'SELECT id FROM courses WHERE id = $1 AND instructor_id = $2',
        [courseId, instructorId]
      );
      
      if (courseCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear certificaciones en este curso'
        });
      }

      // Validar requisitos mínimos
      const validationResult = await CourseValidator.validateCertificationRequirements(
        courseId,
        value.requirements,
        db
      );

      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Requisitos de certificación inválidos',
          errors: validationResult.errors
        });
      }

      // Guardar configuración de certificación (en tabla de metadatos o JSON)
      const configQuery = `
        UPDATE courses 
        SET certification_config = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, certification_config
      `;

      const certificationConfig = {
        title: value.title,
        description: value.description,
        requirements: value.requirements,
        created_at: new Date().toISOString()
      };

      const result = await db.query(configQuery, [
        JSON.stringify(certificationConfig),
        courseId
      ]);

      res.status(201).json({
        success: true,
        message: 'Certificación configurada exitosamente',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating certification:', error);
      res.status(500).json({
        success: false,
        message: 'Error al configurar la certificación',
        error: error.message
      });
    }
  }
};