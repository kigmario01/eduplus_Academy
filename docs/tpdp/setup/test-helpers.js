/**
 * Utilidades y Funciones Auxiliares para Pruebas
 * 
 * Este archivo contiene funciones reutilizables que simplifican la escritura
 * de pruebas de integración y reducen la duplicación de código.
 * 
 * @module test-helpers
 * @requires supertest
 * @requires crypto
 */

const request = require('supertest');
const crypto = require('crypto');

// URLs de los servicios - obtenidas de variables de entorno o valores por defecto
const SERVICES = {
  auth: process.env.TEST_AUTH_SERVICE_URL || 'http://localhost:4000',
  courses: process.env.TEST_COURSE_SERVICE_URL || 'http://localhost:5003',
  evaluation: process.env.TEST_EVALUATION_SERVICE_URL || 'http://localhost:5005'
};

/**
 * Genera datos de usuario aleatorios para pruebas
 * @param {Object} overrides - Propiedades específicas a sobrescribir
 * @returns {Object} Datos de usuario completos
 */
function generateUserData(overrides = {}) {
  const randomId = crypto.randomBytes(4).toString('hex');
  
  return {
    email: `test.user.${randomId}@eduplus.com`,
    password: 'TestPassword123!',
    name: `Test User ${randomId}`,
    role: 'student',
    bio: `Usuario de prueba generado automáticamente`,
    ...overrides
  };
}

/**
 * Genera datos de curso aleatorios para pruebas
 * @param {Object} overrides - Propiedades específicas a sobrescribir
 * @returns {Object} Datos de curso completos
 */
function generateCourseData(overrides = {}) {
  const randomId = crypto.randomBytes(4).toString('hex');
  const categories = ['programming', 'design', 'business', 'marketing', 'data-science'];
  const levels = ['beginner', 'intermediate', 'advanced'];
  
  return {
    title: `Curso de Prueba ${randomId}`,
    description: `Descripción del curso de prueba ${randomId}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    level: levels[Math.floor(Math.random() * levels.length)],
    duration: Math.floor(Math.random() * 300) + 60, // 60-360 minutos
    price: Math.floor(Math.random() * 200) + 19.99, // $19.99 - $219.99
    language: 'es',
    sections: [
      {
        title: 'Introducción',
        content: 'Contenido de introducción',
        order: 1,
        type: 'video',
        duration: 15
      },
      {
        title: 'Conceptos Básicos',
        content: 'Contenido de conceptos básicos',
        order: 2,
        type: 'reading',
        duration: 30
      }
    ],
    ...overrides
  };
}

/**
 * Genera datos de evaluación aleatorios para pruebas
 * @param {Object} overrides - Propiedades específicas a sobrescribir
 * @returns {Object} Datos de evaluación completos
 */
function generateEvaluationData(overrides = {}) {
  const randomId = crypto.randomBytes(4).toString('hex');
  const types = ['multiple-choice', 'true-false', 'practical', 'essay'];
  
  const baseData = {
    title: `Evaluación de Prueba ${randomId}`,
    description: `Descripción de la evaluación ${randomId}`,
    type: types[Math.floor(Math.random() * types.length)],
    timeLimit: Math.floor(Math.random() * 60) + 15, // 15-75 minutos
    passingScore: Math.floor(Math.random() * 30) + 70, // 70-100%
    totalQuestions: Math.floor(Math.random() * 15) + 5, // 5-20 preguntas
    ...overrides
  };

  // Generar preguntas según el tipo
  switch (baseData.type) {
    case 'multiple-choice':
      baseData.questions = Array.from({ length: baseData.totalQuestions }, (_, i) => ({
        question: `Pregunta ${i + 1} de opción múltiple`,
        options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correctAnswer: Math.floor(Math.random() * 4),
        points: Math.floor(Math.random() * 10) + 5
      }));
      break;
      
    case 'true-false':
      baseData.questions = Array.from({ length: baseData.totalQuestions }, (_, i) => ({
        question: `Pregunta ${i + 1} de verdadero/falso`,
        correctAnswer: Math.random() > 0.5,
        points: Math.floor(Math.random() * 10) + 5
      }));
      break;
      
    case 'practical':
      baseData.instructions = `Instrucciones para el ejercicio práctico ${randomId}`;
      baseData.testCases = [
        { input: 'test1', expectedOutput: 'output1' },
        { input: 'test2', expectedOutput: 'output2' }
      ];
      break;
      
    case 'essay':
      baseData.questions = Array.from({ length: baseData.totalQuestions }, (_, i) => ({
        question: `Pregunta ${i + 1} de ensayo`,
        maxWords: Math.floor(Math.random() * 200) + 100,
        points: Math.floor(Math.random() * 20) + 10
      }));
      break;
  }

  return baseData;
}

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} userData - Datos del usuario
 * @param {string} serviceUrl - URL del servicio de autenticación
 * @returns {Promise<Object>} Respuesta del registro
 */
async function registerUser(userData, serviceUrl = SERVICES.auth) {
  const response = await request(serviceUrl)
    .post('/api/auth/register')
    .send(userData);
  
  if (response.status !== 201) {
    throw new Error(`Error al registrar usuario: ${response.body.message}`);
  }
  
  return response.body;
}

/**
 * Realiza login y obtiene token JWT
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} serviceUrl - URL del servicio de autenticación
 * @returns {Promise<string>} Token JWT
 */
async function loginAndGetToken(email, password, serviceUrl = SERVICES.auth) {
  const response = await request(serviceUrl)
    .post('/api/auth/login')
    .send({ email, password });
  
  if (response.status !== 200) {
    throw new Error(`Error al hacer login: ${response.body.message}`);
  }
  
  return response.body.token;
}

/**
 * Crea un usuario completo (registro + login)
 * @param {Object} userData - Datos del usuario
 * @param {string} serviceUrl - URL del servicio de autenticación
 * @returns {Promise<Object>} Objeto con usuario y token
 */
async function createCompleteUser(userData, serviceUrl = SERVICES.auth) {
  // Registrar usuario
  const registrationResponse = await registerUser(userData, serviceUrl);
  
  // Hacer login para obtener token
  const token = await loginAndGetToken(userData.email, userData.password, serviceUrl);
  
  return {
    user: registrationResponse.data,
    token: token,
    email: userData.email,
    password: userData.password
  };
}

/**
 * Crea un curso completo con un instructor
 * @param {string} instructorToken - Token JWT del instructor
 * @param {Object} courseData - Datos del curso
 * @param {string} serviceUrl - URL del servicio de cursos
 * @returns {Promise<Object>} Curso creado
 */
async function createCourse(instructorToken, courseData, serviceUrl = SERVICES.courses) {
  const response = await request(serviceUrl)
    .post('/api/courses')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send(courseData);
  
  if (response.status !== 201) {
    throw new Error(`Error al crear curso: ${response.body.message}`);
  }
  
  return response.body.data;
}

/**
 * Inscribe un estudiante en un curso
 * @param {string} studentToken - Token JWT del estudiante
 * @param {string} courseId - ID del curso
 * @param {string} serviceUrl - URL del servicio de cursos
 * @returns {Promise<Object>} Inscripción creada
 */
async function enrollStudent(studentToken, courseId, serviceUrl = SERVICES.courses) {
  const response = await request(serviceUrl)
    .post('/api/enrollments')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ courseId });
  
  if (response.status !== 201) {
    throw new Error(`Error al inscribir estudiante: ${response.body.message}`);
  }
  
  return response.body.data;
}

/**
 * Crea una evaluación para un curso
 * @param {string} instructorToken - Token JWT del instructor
 * @param {string} courseId - ID del curso
 * @param {Object} evaluationData - Datos de la evaluación
 * @param {string} serviceUrl - URL del servicio de evaluaciones
 * @returns {Promise<Object>} Evaluación creada
 */
async function createEvaluation(instructorToken, courseId, evaluationData, serviceUrl = SERVICES.evaluation) {
  const response = await request(serviceUrl)
    .post('/api/evaluations')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      ...evaluationData,
      courseId
    });
  
  if (response.status !== 201) {
    throw new Error(`Error al crear evaluación: ${response.body.message}`);
  }
  
  return response.body.data;
}

/**
 * Publica una evaluación
 * @param {string} instructorToken - Token JWT del instructor
 * @param {string} evaluationId - ID de la evaluación
 * @param {string} serviceUrl - URL del servicio de evaluaciones
 * @returns {Promise<Object>} Evaluación publicada
 */
async function publishEvaluation(instructorToken, evaluationId, serviceUrl = SERVICES.evaluation) {
  const response = await request(serviceUrl)
    .put(`/api/evaluations/${evaluationId}/publish`)
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({});
  
  if (response.status !== 200) {
    throw new Error(`Error al publicar evaluación: ${response.body.message}`);
  }
  
  return response.body.data;
}

/**
 * Presenta una evaluación
 * @param {string} studentToken - Token JWT del estudiante
 * @param {string} evaluationId - ID de la evaluación
 * @param {Array} answers - Respuestas del estudiante
 * @param {number} timeSpent - Tiempo empleado en minutos
 * @param {string} serviceUrl - URL del servicio de evaluaciones
 * @returns {Promise<Object>} Resultado de la presentación
 */
async function submitEvaluation(studentToken, evaluationId, answers, timeSpent, serviceUrl = SERVICES.evaluation) {
  const response = await request(serviceUrl)
    .post(`/api/evaluations/${evaluationId}/submit`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      answers,
      timeSpent
    });
  
  if (response.status !== 201) {
    throw new Error(`Error al presentar evaluación: ${response.body.message}`);
  }
  
  return response.body.data;
}

/**
 * Crea el flujo completo de un curso con evaluación
 * @param {Object} instructor - Datos del instructor (con token)
 * @param {Object} courseData - Datos del curso
 * @param {Object} evaluationData - Datos de la evaluación
 * @returns {Promise<Object>} Objeto con curso y evaluación creados
 */
async function createCompleteCourseWithEvaluation(instructor, courseData, evaluationData) {
  // Crear curso
  const course = await createCourse(instructor.token, courseData);
  
  // Crear evaluación
  const evaluation = await createEvaluation(instructor.token, course._id, evaluationData);
  
  // Publicar evaluación
  const publishedEvaluation = await publishEvaluation(instructor.token, evaluation._id);
  
  return {
    course,
    evaluation: publishedEvaluation
  };
}

/**
 * Limpia los datos de prueba de un usuario
 * @param {string} email - Email del usuario a limpiar
 * @param {string} serviceUrl - URL del servicio de autenticación
 */
async function cleanupUser(email, serviceUrl = SERVICES.auth) {
  try {
    // Intentar eliminar el usuario (si el endpoint existe)
    const adminToken = await getAuthToken('admin@eduplus.com', 'admin123'); // Asumiendo credenciales de admin
    await request(serviceUrl)
      .delete(`/api/admin/users/${email}`)
      .set('Authorization', `Bearer ${adminToken}`);
  } catch (error) {
    console.warn(`No se pudo limpiar usuario ${email}:`, error.message);
  }
}

/**
 * Espera un tiempo específico (útil para pruebas de timeout)
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promesa que se resuelve después del tiempo especificado
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Genera un token JWT inválido para pruebas de autenticación
 * @returns {string} Token JWT malformado
 */
function generateInvalidToken() {
  return 'invalid.token.here';
}

/**
 * Genera un token JWT expirado para pruebas
 * @returns {string} Token JWT expirado
 */
function generateExpiredToken() {
  // Crear un payload con fecha de expiración en el pasado
  const payload = {
    userId: 'test-user',
    email: 'test@example.com',
    role: 'student',
    exp: Math.floor(Date.now() / 1000) - 3600 // Expirado hace 1 hora
  };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'expired-signature';
  
  return `${header}.${payloadEncoded}.${signature}`;
}

/**
 * Verifica que una respuesta tenga la estructura estándar de error
 * @param {Object} response - Respuesta HTTP a verificar
 * @param {number} expectedStatus - Código de estado esperado
 * @param {string} expectedMessage - Mensaje de error esperado (opcional)
 */
function expectErrorResponse(response, expectedStatus, expectedMessage) {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message');
  
  if (expectedMessage) {
    expect(response.body.message.toLowerCase()).toContain(expectedMessage.toLowerCase());
  }
}

/**
 * Verifica que una respuesta tenga la estructura estándar de éxito
 * @param {Object} response - Respuesta HTTP a verificar
 * @param {number} expectedStatus - Código de estado esperado
 * @param {Object} expectedData - Datos esperados en la respuesta (opcional)
 */
function expectSuccessResponse(response, expectedStatus = 200, expectedData = null) {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('data');
  
  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
}

/**
 * Crea un ambiente de prueba completo con usuarios, curso y evaluación
 * @param {Object} options - Opciones de configuración
 * @returns {Promise<Object>} Ambiente de prueba completo
 */
async function createTestEnvironment(options = {}) {
  const {
    createInstructor = true,
    createStudents = 1,
    createCourse = true,
    createEvaluation = true,
    publishEvaluation = true
  } = options;
  
  const environment = {};
  
  // Crear instructor si se solicita
  if (createInstructor) {
    const instructorData = generateUserData({ role: 'instructor' });
    environment.instructor = await createCompleteUser(instructorData);
    console.log('📚 Instructor creado:', environment.instructor.user.email);
  }
  
  // Crear estudiantes si se solicita
  if (createStudents > 0) {
    environment.students = [];
    for (let i = 0; i < createStudents; i++) {
      const studentData = generateUserData({ role: 'student' });
      const student = await createCompleteUser(studentData);
      environment.students.push(student);
      console.log(`👨‍🎓 Estudiante ${i + 1} creado:`, student.user.email);
    }
  }
  
  // Crear curso si se solicita
  if (createCourse && environment.instructor) {
    const courseData = generateCourseData();
    environment.course = await createCourse(environment.instructor.token, courseData);
    console.log('📖 Curso creado:', environment.course.title);
    
    // Inscribir estudiantes si existen
    if (environment.students) {
      for (const student of environment.students) {
        await enrollStudent(student.token, environment.course._id);
        console.log(`✅ Estudiante inscrito:`, student.user.email);
      }
    }
  }
  
  // Crear evaluación si se solicita
  if (createEvaluation && environment.instructor && environment.course) {
    const evaluationData = generateEvaluationData();
    environment.evaluation = await createEvaluation(
      environment.instructor.token,
      environment.course._id,
      evaluationData
    );
    console.log('📝 Evaluación creada:', environment.evaluation.title);
    
    // Publicar evaluación si se solicita
    if (publishEvaluation) {
      environment.publishedEvaluation = await publishEvaluation(
        environment.instructor.token,
        environment.evaluation._id
      );
      console.log('📢 Evaluación publicada');
    }
  }
  
  return environment;
}

/**
 * Limpia un ambiente de prueba completo
 * @param {Object} environment - Ambiente de prueba a limpiar
 */
async function cleanupTestEnvironment(environment) {
  console.log('🧹 Limpiando ambiente de prueba...');
  
  try {
    // Limpiar estudiantes
    if (environment.students) {
      for (const student of environment.students) {
        await cleanupUser(student.user.email);
        console.log(`🗑️  Estudiante limpiado:`, student.user.email);
      }
    }
    
    // Limpiar instructor
    if (environment.instructor) {
      await cleanupUser(environment.instructor.user.email);
      console.log('🗑️  Instructor limpiado:', environment.instructor.user.email);
    }
    
    console.log('✅ Ambiente de prueba limpiado exitosamente');
  } catch (error) {
    console.error('❌ Error al limpiar ambiente:', error);
  }
}

/**
 * Simula un servicio caído para pruebas de resiliencia
 * @param {string} serviceUrl - URL del servicio a simular caído
 * @param {number} duration - Duración en ms del fallo simulado
 */
async function simulateServiceDown(serviceUrl, duration = 5000) {
  console.log(`🔴 Simulando caída del servicio: ${serviceUrl}`);
  
  // En un entorno real, aquí se configuraría un proxy o mock
  // Por ahora, solo logeamos la intención
  await wait(duration);
  
  console.log(`🟢 Servicio restaurado: ${serviceUrl}`);
}

/**
 * Mide el tiempo de respuesta de una operación
 * @param {Function} operation - Función a medir
 * @returns {Promise<Object>} Resultado y tiempo de ejecución
 */
async function measurePerformance(operation) {
  const startTime = Date.now();
  const result = await operation();
  const endTime = Date.now();
  
  return {
    result,
    duration: endTime - startTime,
    timestamp: new Date().toISOString()
  };
}

/**
 * Exportar todas las funciones auxiliares
 */
module.exports = {
  // Generadores de datos
  generateUserData,
  generateCourseData,
  generateEvaluationData,
  
  // Operaciones de usuario
  registerUser,
  loginAndGetToken,
  createCompleteUser,
  cleanupUser,
  
  // Operaciones de curso
  createCourse,
  enrollStudent,
  
  // Operaciones de evaluación
  createEvaluation,
  publishEvaluation,
  submitEvaluation,
  
  // Flujos completos
  createCompleteCourseWithEvaluation,
  createTestEnvironment,
  cleanupTestEnvironment,
  
  // Utilidades generales
  wait,
  generateInvalidToken,
  generateExpiredToken,
  expectErrorResponse,
  expectSuccessResponse,
  simulateServiceDown,
  measurePerformance,
  
  // Constantes
  SERVICES
};