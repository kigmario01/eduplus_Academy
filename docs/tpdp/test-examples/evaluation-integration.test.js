/**
 * Pruebas de Integración - Servicio de Evaluación
 * 
 * Este archivo contiene pruebas que verifican el flujo completo de evaluaciones,
 * incluyendo creación de exámenes, presentación de evaluaciones, calificación
 * automática y generación de certificados.
 * 
 * @module evaluation-integration
 * @requires supertest
 * @requires jsonwebtoken
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// URLs de los servicios
const AUTH_SERVICE_URL = process.env.TEST_AUTH_SERVICE_URL || 'http://localhost:4000';
const COURSE_SERVICE_URL = process.env.TEST_COURSE_SERVICE_URL || 'http://localhost:5003';
const EVALUATION_SERVICE_URL = process.env.TEST_EVALUATION_SERVICE_URL || 'http://localhost:5005';

/**
 * Datos de prueba para evaluaciones
 * Incluye diferentes tipos de preguntas y exámenes
 */
const testEvaluations = {
  multipleChoice: {
    title: 'Examen de JavaScript Básico',
    description: 'Evaluación de conocimientos fundamentales de JavaScript',
    type: 'multiple-choice',
    timeLimit: 30, // minutos
    passingScore: 70, // porcentaje mínimo para aprobar
    totalQuestions: 10,
    questions: [
      {
        question: '¿Cuál es la forma correcta de declarar una variable en JavaScript?',
        options: [
          'var myVariable = 5;',
          'variable myVariable = 5;',
          'v myVariable = 5;',
          'declare myVariable = 5;'
        ],
        correctAnswer: 0,
        points: 10
      },
      {
        question: '¿Qué método se usa para agregar un elemento al final de un array?',
        options: [
          'append()',
          'push()',
          'add()',
          'insert()'
        ],
        correctAnswer: 1,
        points: 10
      }
    ]
  },
  trueFalse: {
    title: 'Verdadero o Falso - Conceptos de Programación',
    description: 'Evaluación de conceptos teóricos',
    type: 'true-false',
    timeLimit: 15,
    passingScore: 80,
    totalQuestions: 5,
    questions: [
      {
        question: 'JavaScript es un lenguaje de programación orientado a objetos.',
        correctAnswer: true,
        points: 20
      },
      {
        question: 'HTML es un lenguaje de programación.',
        correctAnswer: false,
        points: 20
      }
    ]
  },
  practical: {
    title: 'Ejercicio Práctico - Funciones en JavaScript',
    description: 'Implementación de funciones JavaScript',
    type: 'practical',
    timeLimit: 45,
    passingScore: 75,
    instructions: 'Crea una función que calcule el factorial de un número',
    testCases: [
      {
        input: '5',
        expectedOutput: '120'
      },
      {
        input: '0',
        expectedOutput: '1'
      }
    ]
  }
};

/**
 * Usuarios de prueba con diferentes roles
 */
const testUsers = {
  instructor: {
    email: 'test.instructor@eduplus.com',
    password: 'TestInstructor123!',
    name: 'Test Instructor',
    role: 'instructor'
  },
  student: {
    email: 'test.student@eduplus.com',
    password: 'TestStudent123!',
    name: 'Test Student',
    role: 'student'
  }
};

/**
 * Función auxiliar para obtener token de autenticación
 */
async function getAuthToken(user) {
  const response = await request(AUTH_SERVICE_URL)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: user.password
    });
  
  return response.body.token;
}

/**
 * Función auxiliar para crear un curso y obtener su ID
 */
async function createTestCourse(instructorToken) {
  const courseResponse = await request(COURSE_SERVICE_URL)
    .post('/api/courses')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      title: 'Curso de Prueba para Evaluaciones',
      description: 'Curso creado específicamente para pruebas de evaluación',
      category: 'programming',
      level: 'beginner',
      duration: 60,
      price: 0, // Gratis para pruebas
      language: 'es'
    });
  
  return courseResponse.body.data._id;
}

/**
 * Función auxiliar para inscribir un estudiante en un curso
 */
async function enrollStudent(studentToken, courseId) {
  return await request(COURSE_SERVICE_URL)
    .post('/api/enrollments')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ courseId });
}

/**
 * Suite de pruebas: Creación de evaluaciones por instructores
 */
describe('POST /api/evaluations - Creación de evaluaciones', () => {
  let instructorToken;
  let courseId;

  beforeAll(async () => {
    // Preparar: Obtener token de instructor y crear curso
    instructorToken = await getAuthToken(testUsers.instructor);
    courseId = await createTestCourse(instructorToken);
  });

  /**
   * Caso de prueba: Creación de examen de opción múltiple
   * Verifica que un instructor pueda crear un examen completo con múltiples preguntas
   */
  it('debe permitir crear examen de opción múltiple con configuración completa', async () => {
    // Arrange: Datos del examen
    const evaluationData = {
      courseId: courseId,
      ...testEvaluations.multipleChoice
    };

    // Act: Crear evaluación
    const response = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(evaluationData)
      .expect('Content-Type', /json/);

    // Assert: Verificar evaluación creada
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('title', evaluationData.title);
    expect(response.body.data).toHaveProperty('questions');
    expect(response.body.data.questions).toHaveLength(evaluationData.totalQuestions);
    expect(response.body.data).toHaveProperty('status', 'draft'); // Las evaluaciones nuevas empiezan como borrador
    expect(response.body.data).toHaveProperty('createdBy');
  });

  /**
   * Caso de prueba: Validación de preguntas
   * Verifica que se validen las preguntas antes de crear la evaluación
   */
  it('debe validar que las preguntas tengan la estructura correcta', async () => {
    // Arrange: Preguntas con estructura inválida
    const invalidEvaluation = {
      courseId: courseId,
      title: 'Examen con preguntas inválidas',
      type: 'multiple-choice',
      questions: [
        {
          question: 'Pregunta sin opciones',
          // Falta el array de opciones
          correctAnswer: 0
        }
      ]
    };

    // Act: Intentar crear evaluación
    const response = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(invalidEvaluation);

    // Assert: Verificar error de validación
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  /**
   * Caso de prueba: Creación de examen verdadero/falso
   * Verifica el formato específico de preguntas de verdadero/falso
   */
  it('debe crear examen de verdadero/falso con preguntas válidas', async () => {
    // Arrange: Datos de examen V/F
    const trueFalseData = {
      courseId: courseId,
      ...testEvaluations.trueFalse
    };

    // Act: Crear evaluación V/F
    const response = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(trueFalseData);

    // Assert: Verificar estructura V/F
    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe('true-false');
    
    // Verificar que cada pregunta tenga formato V/F
    response.body.data.questions.forEach(question => {
      expect(question).toHaveProperty('correctAnswer');
      expect(typeof question.correctAnswer).toBe('boolean');
      expect(question).not.toHaveProperty('options'); // No debe tener opciones
    });
  });

  /**
   * Caso de prueba: Creación de evaluación práctica
   * Verifica el formato específico de evaluaciones prácticas
   */
  it('debe crear evaluación práctica con casos de prueba', async () => {
    // Arrange: Datos de evaluación práctica
    const practicalData = {
      courseId: courseId,
      ...testEvaluations.practical
    };

    // Act: Crear evaluación práctica
    const response = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(practicalData);

    // Assert: Verificar estructura práctica
    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe('practical');
    expect(response.body.data).toHaveProperty('instructions');
    expect(response.body.data).toHaveProperty('testCases');
    expect(Array.isArray(response.body.data.testCases)).toBe(true);
    expect(response.body.data.testCases.length).toBeGreaterThan(0);
  });
});

/**
 * Suite de pruebas: Publicación de evaluaciones
 */
describe('PUT /api/evaluations/:id/publish - Publicación de evaluaciones', () => {
  let instructorToken;
  let evaluationId;

  beforeEach(async () => {
    // Preparar: Crear evaluación en borrador
    instructorToken = await getAuthToken(testUsers.instructor);
    const courseId = await createTestCourse(instructorToken);
    
    const createResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        ...testEvaluations.multipleChoice
      });
    
    evaluationId = createResponse.body.data._id;
  });

  /**
   * Caso de prueba: Publicación exitosa
   * Verifica que un instructor pueda publicar una evaluación
   */
  it('debe permitir publicar una evaluación completada', async () => {
    // Act: Publicar evaluación
    const response = await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({})
      .expect('Content-Type', /json/);

    // Assert: Verificar publicación
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('status', 'published');
    expect(response.body.data).toHaveProperty('publishedAt');
    expect(response.body.data.publishedAt).toBeTruthy();
  });

  /**
   * Caso de prueba: Prevención de publicación de evaluación incompleta
   * Verifica que no se puedan publicar evaluaciones sin preguntas
   */
  it('debe rechazar publicación de evaluación sin preguntas', async () => {
    // Arrange: Crear evaluación sin preguntas
    const courseId = await createTestCourse(instructorToken);
    const incompleteResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        title: 'Evaluación sin preguntas',
        type: 'multiple-choice',
        questions: [] // Sin preguntas
      });
    
    const incompleteId = incompleteResponse.body.data._id;

    // Act: Intentar publicar
    const response = await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${incompleteId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);

    // Assert: Verificar rechazo
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });
});

/**
 * Suite de pruebas: Presentación de evaluaciones por estudiantes
 */
describe('POST /api/evaluations/:id/submit - Presentación de evaluaciones', () => {
  let studentToken;
  let instructorToken;
  let courseId;
  let evaluationId;

  beforeAll(async () => {
    // Preparar: Crear ambiente completo para pruebas
    instructorToken = await getAuthToken(testUsers.instructor);
    studentToken = await getAuthToken(testUsers.student);
    
    courseId = await createTestCourse(instructorToken);
    
    // Inscribir estudiante
    await enrollStudent(studentToken, courseId);
    
    // Crear y publicar evaluación
    const createResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        ...testEvaluations.multipleChoice
      });
    
    evaluationId = createResponse.body.data._id;
    
    // Publicar evaluación
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
  });

  /**
   * Caso de prueba: Presentación exitosa de evaluación
   * Verifica que un estudiante pueda presentar una evaluación completa
   */
  it('debe permitir a un estudiante presentar una evaluación publicada', async () => {
    // Arrange: Respuestas del estudiante (con algunas correctas, algunas incorrectas)
    const studentAnswers = {
      answers: [
        { questionIndex: 0, answer: 0 }, // Correcta
        { questionIndex: 1, answer: 2 }  // Incorrecta
      ],
      timeSpent: 25 // minutos
    };

    // Act: Presentar evaluación
    const response = await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluationId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send(studentAnswers)
      .expect('Content-Type', /json/);

    // Assert: Verificar presentación
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('score');
    expect(response.body.data).toHaveProperty('passed');
    expect(response.body.data).toHaveProperty('submittedAt');
    
    // Verificar que el puntaje esté entre 0 y 100
    expect(response.body.data.score).toBeGreaterThanOrEqual(0);
    expect(response.body.data.score).toBeLessThanOrEqual(100);
    
    // Con 1 de 2 respuestas correctas, el puntaje debe ser 50
    expect(response.body.data.score).toBe(50);
    expect(response.body.data.passed).toBe(false); // No alcanzó el 70% mínimo
  });

  /**
   * Caso de prueba: Prevención de doble presentación
   * Verifica que un estudiante no pueda presentar la misma evaluación dos veces
   */
  it('debe prevenir doble presentación de la misma evaluación', async () => {
    // Arrange: Intentar presentar nuevamente
    const duplicateAnswers = {
      answers: [{ questionIndex: 0, answer: 0 }],
      timeSpent: 20
    };

    // Act: Intentar segunda presentación
    const response = await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluationId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send(duplicateAnswers);

    // Assert: Verificar rechazo
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('ya presentado');
  });

  /**
   * Caso de prueba: Validación de respuestas incompletas
   * Verifica que se valide que todas las preguntas tengan respuesta
   */
  it('debe validar que todas las preguntas estén respondidas', async () => {
    // Arrange: Crear nueva evaluación para este test
    const newEvalResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        title: 'Evaluación para test incompleto',
        type: 'multiple-choice',
        totalQuestions: 3,
        questions: [
          { question: 'Pregunta 1', options: ['A', 'B'], correctAnswer: 0, points: 10 },
          { question: 'Pregunta 2', options: ['A', 'B'], correctAnswer: 1, points: 10 },
          { question: 'Pregunta 3', options: ['A', 'B'], correctAnswer: 0, points: 10 }
        ]
      });
    
    const newEvaluationId = newEvalResponse.body.data._id;
    
    // Publicar nueva evaluación
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${newEvaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);

    // Act: Intentar presentar con respuestas incompletas
    const incompleteAnswers = {
      answers: [
        { questionIndex: 0, answer: 0 }
        // Faltan las otras 2 preguntas
      ],
      timeSpent: 15
    };

    const response = await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${newEvaluationId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send(incompleteAnswers);

    // Assert: Verificar validación
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });
});

/**
 * Suite de pruebas: Calificación y resultados
 */
describe('GET /api/evaluations/results - Resultados de evaluaciones', () => {
  let studentToken;
  let instructorToken;
  let courseId;
  let evaluationId;
  let submissionId;

  beforeAll(async () => {
    // Preparar: Crear ambiente y presentación
    instructorToken = await getAuthToken(testUsers.instructor);
    studentToken = await getAuthToken(testUsers.student);
    
    courseId = await createTestCourse(instructorToken);
    await enrollStudent(studentToken, courseId);
    
    // Crear y publicar evaluación
    const createResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        ...testEvaluations.multipleChoice
      });
    
    evaluationId = createResponse.body.data._id;
    
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
    
    // Presentar evaluación
    const submitResponse = await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluationId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: testEvaluations.multipleChoice.questions.map((q, i) => ({
          questionIndex: i,
          answer: q.correctAnswer // Todas correctas para este test
        })),
        timeSpent: 20
      });
    
    submissionId = submitResponse.body.data._id;
  });

  /**
   * Caso de prueba: Estudiante consulta sus resultados
   * Verifica que un estudiante pueda ver sus propios resultados
   */
  it('debe permitir al estudiante consultar sus resultados', async () => {
    // Act: Consultar resultados
    const response = await request(EVALUATION_SERVICE_URL)
      .get(`/api/evaluations/${evaluationId}/results/${submissionId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect('Content-Type', /json/);

    // Assert: Verificar resultados
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('score', 100); // Todas correctas
    expect(response.body.data).toHaveProperty('passed', true);
    expect(response.body.data).toHaveProperty('answers');
    expect(response.body.data).toHaveProperty('detailedResults');
    
    // Verificar que se incluya retroalimentación por pregunta
    expect(response.body.data.detailedResults).toBeInstanceOf(Array);
    response.body.data.detailedResults.forEach(result => {
      expect(result).toHaveProperty('question');
      expect(result).toHaveProperty('studentAnswer');
      expect(result).toHaveProperty('correctAnswer');
      expect(result).toHaveProperty('isCorrect');
      expect(result).toHaveProperty('points');
    });
  });

  /**
   * Caso de prueba: Instructor consulta resultados de sus estudiantes
   * Verifica que un instructor pueda ver los resultados de sus estudiantes
   */
  it('debe permitir al instructor consultar resultados de sus estudiantes', async () => {
    // Act: Consultar todos los resultados del curso
    const response = await request(EVALUATION_SERVICE_URL)
      .get(`/api/evaluations/${evaluationId}/results`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .expect('Content-Type', /json/);

    // Assert: Verificar resultados del instructor
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Verificar que se incluyan estadísticas agregadas
    expect(response.body).toHaveProperty('statistics');
    expect(response.body.statistics).toHaveProperty('totalSubmissions');
    expect(response.body.statistics).toHaveProperty('averageScore');
    expect(response.body.statistics).toHaveProperty('passRate');
  });

  /**
   * Caso de prueba: Estadísticas detalladas de evaluación
   * Verifica que se proporcionen estadísticas útiles para el instructor
   */
  it('debe proporcionar estadísticas detalladas de la evaluación', async () => {
    // Act: Consultar estadísticas
    const response = await request(EVALUATION_SERVICE_URL)
      .get(`/api/evaluations/${evaluationId}/statistics`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .expect('Content-Type', /json/);

    // Assert: Verificar estadísticas
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    
    const stats = response.body.data;
    expect(stats).toHaveProperty('totalPresentations');
    expect(stats).toHaveProperty('averageScore');
    expect(stats).toHaveProperty('highestScore');
    expect(stats).toHaveProperty('lowestScore');
    expect(stats).toHaveProperty('passRate');
    expect(stats).toHaveProperty('averageTimeSpent');
    
    // Verificar análisis por pregunta
    expect(stats).toHaveProperty('questionAnalysis');
    expect(Array.isArray(stats.questionAnalysis)).toBe(true);
    stats.questionAnalysis.forEach(analysis => {
      expect(analysis).toHaveProperty('questionIndex');
      expect(analysis).toHaveProperty('correctAnswers');
      expect(analysis).toHaveProperty('incorrectAnswers');
      expect(analysis).toHaveProperty('difficulty');
    });
  });
});

/**
 * Suite de pruebas: Certificados
 */
describe('POST /api/certificates - Generación de certificados', () => {
  let studentToken;
  let instructorToken;
  let courseId;
  let evaluationId;

  beforeAll(async () => {
    // Preparar: Crear ambiente completo
    instructorToken = await getAuthToken(testUsers.instructor);
    studentToken = await getAuthToken(testUsers.student);
    
    courseId = await createTestCourse(instructorToken);
    await enrollStudent(studentToken, courseId);
    
    // Crear y publicar evaluación
    const createResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        ...testEvaluations.multipleChoice
      });
    
    evaluationId = createResponse.body.data._id;
    
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
    
    // Presentar evaluación con puntaje aprobatorio
    await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluationId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: testEvaluations.multipleChoice.questions.map((q, i) => ({
          questionIndex: i,
          answer: q.correctAnswer // Todas correctas
        })),
        timeSpent: 25
      });
  });

  /**
   * Caso de prueba: Generación automática de certificado
   * Verifica que se genere un certificado cuando el estudiante aprueba
   */
  it('debe generar certificado automáticamente al aprobar evaluación', async () => {
    // Act: Verificar que el certificado fue generado
    const response = await request(EVALUATION_SERVICE_URL)
      .get(`/api/certificates/course/${courseId}/student/me`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect('Content-Type', /json/);

    // Assert: Verificar certificado
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('certificateNumber');
    expect(response.body.data).toHaveProperty('studentName', testUsers.student.name);
    expect(response.body.data).toHaveProperty('courseName');
    expect(response.body.data).toHaveProperty('issueDate');
    expect(response.body.data).toHaveProperty('score');
    expect(response.body.data.score).toBeGreaterThanOrEqual(70); // Puntaje mínimo
  });

  /**
   * Caso de prueba: Verificación de validez de certificado
   * Verifica que los certificados puedan ser verificados por terceros
   */
  it('debe permitir verificar la validez de un certificado', async () => {
    // Arrange: Obtener certificado
    const certResponse = await request(EVALUATION_SERVICE_URL)
      .get(`/api/certificates/course/${courseId}/student/me`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    const certificateNumber = certResponse.body.data.certificateNumber;

    // Act: Verificar certificado (sin autenticación, como lo haría un tercero)
    const verifyResponse = await request(EVALUATION_SERVICE_URL)
      .get(`/api/certificates/verify/${certificateNumber}`)
      .expect('Content-Type', /json/);

    // Assert: Verificar validez
    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body).toHaveProperty('success', true);
    expect(verifyResponse.body).toHaveProperty('valid', true);
    expect(verifyResponse.body).toHaveProperty('data');
    expect(verifyResponse.body.data).toHaveProperty('certificateNumber', certificateNumber);
    expect(verifyResponse.body.data).toHaveProperty('studentName');
    expect(verifyResponse.body.data).toHaveProperty('courseName');
    expect(verifyResponse.body.data).toHaveProperty('issueDate');
  });

  /**
   * Caso de prueba: Prevención de certificados para evaluaciones no aprobadas
   * Verifica que no se generen certificados para evaluaciones reprobadas
   */
  it('debe rechazar certificado para evaluación no aprobada', async () => {
    // Arrange: Crear nueva evaluación difícil y presentarla con bajo puntaje
    const difficultEvalResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        title: 'Evaluación Difícil',
        type: 'multiple-choice',
        passingScore: 90, // Muy alto
        totalQuestions: 10,
        questions: Array.from({ length: 10 }, (_, i) => ({
          question: `Pregunta ${i + 1}`,
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          points: 10
        }))
      });
    
    const difficultEvalId = difficultEvalResponse.body.data._id;
    
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${difficultEvalId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
    
    // Presentar con puntaje bajo
    await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${difficultEvalId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: Array.from({ length: 10 }, (_, i) => ({
          questionIndex: i,
          answer: i % 2 // Solo la mitad correctas
        })),
        timeSpent: 20
      });

    // Act: Intentar obtener certificado
    const response = await request(EVALUATION_SERVICE_URL)
      .get(`/api/certificates/course/${courseId}/evaluation/${difficultEvalId}/student/me`)
      .set('Authorization', `Bearer ${studentToken}`);

    // Assert: Verificar que no se generó certificado
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });
});

/**
 * Suite de pruebas: Integración con otros servicios
 */
describe('Integración con servicios de cursos y usuarios', () => {
  /**
   * Caso de prueba: Verificación de requisitos antes de evaluación
   * Verifica que el estudiante esté inscrito en el curso antes de poder evaluar
   */
  it('debe verificar que el estudiante esté inscrito antes de permitir evaluación', async () => {
    // Arrange: Crear estudiante no inscrito
    const newStudent = {
      email: 'unenrolled.student@eduplus.com',
      password: 'TestStudent123!',
      name: 'Unenrolled Student',
      role: 'student'
    };
    
    // Registrar nuevo estudiante
    await request(AUTH_SERVICE_URL)
      .post('/api/auth/register')
      .send(newStudent);
    
    const newStudentToken = await getAuthToken(newStudent);
    
    const instructorToken = await getAuthToken(testUsers.instructor);
    const courseId = await createTestCourse(instructorToken);
    
    // Crear y publicar evaluación
    const evalResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        ...testEvaluations.multipleChoice
      });
    
    const evaluationId = evalResponse.body.data._id;
    
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);

    // Act: Intentar presentar sin estar inscrito
    const response = await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluationId}/submit`)
      .set('Authorization', `Bearer ${newStudentToken}`)
      .send({
        answers: [{ questionIndex: 0, answer: 0 }],
        timeSpent: 10
      });

    // Assert: Verificar rechazo por no estar inscrito
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });

  /**
   * Caso de prueba: Actualización de progreso tras evaluación
   * Verifica que el progreso del estudiante se actualice después de presentar
   */
  it('debe actualizar el progreso del estudiante tras presentar evaluación', async () => {
    // Arrange: Configurar ambiente
    const instructorToken = await getAuthToken(testUsers.instructor);
    const studentToken = await getAuthToken(testUsers.student);
    const courseId = await createTestCourse(instructorToken);
    
    await enrollStudent(studentToken, courseId);
    
    // Crear y publicar evaluación
    const evalResponse = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: courseId,
        ...testEvaluations.multipleChoice
      });
    
    const evaluationId = evalResponse.body.data._id;
    
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);

    // Verificar progreso inicial
    const initialProgressResponse = await request(COURSE_SERVICE_URL)
      .get(`/api/enrollments/${courseId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    const initialProgress = initialProgressResponse.body.data.progress;

    // Act: Presentar evaluación
    await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluationId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: testEvaluations.multipleChoice.questions.map((q, i) => ({
          questionIndex: i,
          answer: q.correctAnswer
        })),
        timeSpent: 20
      });

    // Assert: Verificar que el progreso se haya actualizado
    const finalProgressResponse = await request(COURSE_SERVICE_URL)
      .get(`/api/enrollments/${courseId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    const finalProgress = finalProgressResponse.body.data.progress;
    expect(finalProgress).toBeGreaterThan(initialProgress);
  });
});

/**
 * Notas adicionales para el equipo de desarrollo:
 * 
 * 1. Configuración de tiempo para pruebas:
 *    - Las evaluaciones con límite de tiempo requieren consideración especial
 *    - Considerar usar time mocking para pruebas de timeout
 *    - Verificar comportamiento cuando el tiempo se agota
 * 
 * 2. Pruebas de rendimiento de evaluaciones:
 *    - Verificar que la calificación automática sea eficiente
 *    - Probar con exámenes de muchas preguntas (100+)
 *    - Validar tiempos de respuesta bajo carga
 * 
 * 3. Casos edge a considerar:
 *    - Evaluaciones con 0 preguntas
 *    - Preguntas sin respuesta correcta definida
 *    - Respuestas con formato inválido
 *    - Presentaciones simultáneas del mismo estudiante
 * 
 * 4. Integración con servicios externos:
 *    - Notificaciones de resultados por email
 *    - Generación de PDFs para certificados
 *    - Almacenamiento seguro de certificados
 * 
 * 5. Seguridad y validación:
 *    - Prevención de trampa (buscar respuestas online)
 *    - Detección de comportamiento sospechoso
 *    - Validación de integridad de respuestas
 *    - Protección contra manipulación de puntajes
 */