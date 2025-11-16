/**
 * Pruebas de Integración - Integración entre Servicios
 * 
 * Este archivo contiene pruebas que verifican la comunicación y flujo completo
 * entre todos los servicios de EduPlus Academy (auth, courses, evaluation).
 * 
 * @module service-integration
 * @requires supertest
 * @requires jsonwebtoken
 */

const request = require('supertest');

// URLs de todos los servicios
const AUTH_SERVICE_URL = process.env.TEST_AUTH_SERVICE_URL || 'http://localhost:4000';
const COURSE_SERVICE_URL = process.env.TEST_COURSE_SERVICE_URL || 'http://localhost:5003';
const EVALUATION_SERVICE_URL = process.env.TEST_EVALUATION_SERVICE_URL || 'http://localhost:5005';

/**
 * Datos de prueba para flujos completos
 * Incluye usuarios, cursos y evaluaciones para probar el flujo end-to-end
 */
const testData = {
  instructor: {
    email: 'integration.instructor@eduplus.com',
    password: 'IntegrationTest123!',
    name: 'Integration Test Instructor',
    role: 'instructor',
    bio: 'Instructor de prueba para integración',
    expertise: ['JavaScript', 'React', 'Node.js']
  },
  student: {
    email: 'integration.student@eduplus.com',
    password: 'IntegrationTest123!',
    name: 'Integration Test Student',
    role: 'student',
    learningGoals: ['Aprender programación', 'Desarrollo web']
  },
  course: {
    title: 'Curso Completo de Integración',
    description: 'Curso diseñado para probar la integración completa del sistema',
    category: 'programming',
    level: 'intermediate',
    duration: 180,
    price: 99.99,
    language: 'es',
    sections: [
      {
        title: 'Introducción a la Integración',
        content: 'Bienvenidos al curso de integración',
        order: 1,
        type: 'video',
        duration: 15
      },
      {
        title: 'Conceptos Avanzados',
        content: 'Profundizando en conceptos complejos',
        order: 2,
        type: 'reading',
        duration: 30
      }
    ]
  },
  evaluation: {
    title: 'Evaluación Final de Integración',
    description: 'Evaluación completa del curso',
    type: 'multiple-choice',
    timeLimit: 60,
    passingScore: 75,
    totalQuestions: 20,
    questions: Array.from({ length: 20 }, (_, i) => ({
      question: `Pregunta de integración ${i + 1}: ¿Cuál es el propósito de los tests de integración?`,
      options: [
        'Verificar funcionalidad individual',
        'Validar comunicación entre servicios',
        'Medir rendimiento',
        'Documentar código'
      ],
      correctAnswer: 1,
      points: 5
    }))
  }
};

/**
 * Funciones auxiliares para flujos completos
 */

/**
 * Registra un usuario en el sistema
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise<Object>} Usuario registrado
 */
async function registerUser(userData) {
  const response = await request(AUTH_SERVICE_URL)
    .post('/api/auth/register')
    .send(userData);
  
  return response.body;
}

/**
 * Obtiene token de autenticación para un usuario
 * @param {Object} credentials - Email y password del usuario
 * @returns {Promise<string>} Token JWT
 */
async function getAuthToken(credentials) {
  const response = await request(AUTH_SERVICE_URL)
    .post('/api/auth/login')
    .send(credentials);
  
  return response.body.token;
}

/**
 * Crea un curso completo con secciones
 * @param {string} instructorToken - Token del instructor
 * @param {Object} courseData - Datos del curso
 * @returns {Promise<Object>} Curso creado
 */
async function createFullCourse(instructorToken, courseData) {
  const response = await request(COURSE_SERVICE_URL)
    .post('/api/courses')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send(courseData);
  
  return response.body.data;
}

/**
 * Inscribe un estudiante en un curso
 * @param {string} studentToken - Token del estudiante
 * @param {string} courseId - ID del curso
 * @returns {Promise<Object>} Inscripción creada
 */
async function enrollInCourse(studentToken, courseId) {
  const response = await request(COURSE_SERVICE_URL)
    .post('/api/enrollments')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ courseId });
  
  return response.body.data;
}

/**
 * Crea una evaluación para un curso
 * @param {string} instructorToken - Token del instructor
 * @param {string} courseId - ID del curso
 * @param {Object} evaluationData - Datos de la evaluación
 * @returns {Promise<Object>} Evaluación creada
 */
async function createEvaluation(instructorToken, courseId, evaluationData) {
  const response = await request(EVALUATION_SERVICE_URL)
    .post('/api/evaluations')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      ...evaluationData,
      courseId
    });
  
  return response.body.data;
}

/**
 * Suite de pruebas: Flujo completo de registro a certificación
 * Este es el flujo más importante que verifica toda la integración
 */
describe('Flujo Completo: Registro → Curso → Evaluación → Certificado', () => {
  let instructorToken;
  let studentToken;
  let courseId;
  let evaluationId;

  /**
   * Caso de prueba: Flujo completo exitoso
   * Verifica que un usuario pueda completar todo el flujo educativo
   */
  it('debe completar el flujo completo desde registro hasta certificado', async () => {
    console.log('🚀 Iniciando flujo de integración completo...');

    // Paso 1: Registrar instructor
    console.log('📋 Paso 1: Registrando instructor...');
    const instructorRegisterResponse = await registerUser(testData.instructor);
    expect(instructorRegisterResponse.success).toBe(true);
    expect(instructorRegisterResponse.data).toHaveProperty('userId');
    console.log('✅ Instructor registrado:', instructorRegisterResponse.data.userId);

    // Paso 2: Registrar estudiante
    console.log('📋 Paso 2: Registrando estudiante...');
    const studentRegisterResponse = await registerUser(testData.student);
    expect(studentRegisterResponse.success).toBe(true);
    expect(studentRegisterResponse.data).toHaveProperty('userId');
    console.log('✅ Estudiante registrado:', studentRegisterResponse.data.userId);

    // Paso 3: Login de instructor
    console.log('🔐 Paso 3: Login de instructor...');
    instructorToken = await getAuthToken({
      email: testData.instructor.email,
      password: testData.instructor.password
    });
    expect(instructorToken).toBeTruthy();
    console.log('✅ Instructor autenticado');

    // Paso 4: Login de estudiante
    console.log('🔐 Paso 4: Login de estudiante...');
    studentToken = await getAuthToken({
      email: testData.student.email,
      password: testData.student.password
    });
    expect(studentToken).toBeTruthy();
    console.log('✅ Estudiante autenticado');

    // Paso 5: Crear curso
    console.log('📚 Paso 5: Creando curso...');
    const course = await createFullCourse(instructorToken, testData.course);
    expect(course).toHaveProperty('_id');
    expect(course).toHaveProperty('title', testData.course.title);
    expect(course.sections).toHaveLength(2);
    courseId = course._id;
    console.log('✅ Curso creado:', courseId);

    // Paso 6: Inscribir estudiante
    console.log('📝 Paso 6: Inscribiendo estudiante...');
    const enrollment = await enrollInCourse(studentToken, courseId);
    expect(enrollment).toHaveProperty('_id');
    expect(enrollment.status).toBe('active');
    console.log('✅ Estudiante inscrito:', enrollment._id);

    // Paso 7: Verificar inscripción
    console.log('🔍 Paso 7: Verificando inscripción...');
    const enrollmentCheck = await request(COURSE_SERVICE_URL)
      .get(`/api/enrollments/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(enrollmentCheck.status).toBe(200);
    expect(enrollmentCheck.body.data.status).toBe('active');
    console.log('✅ Inscripción verificada');

    // Paso 8: Crear evaluación
    console.log('📝 Paso 8: Creando evaluación...');
    const evaluation = await createEvaluation(instructorToken, courseId, testData.evaluation);
    expect(evaluation).toHaveProperty('_id');
    expect(evaluation.questions).toHaveLength(20);
    evaluationId = evaluation._id;
    console.log('✅ Evaluación creada:', evaluationId);

    // Paso 9: Publicar evaluación
    console.log('📢 Paso 9: Publicando evaluación...');
    const publishResponse = await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluationId}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
    
    expect(publishResponse.status).toBe(200);
    expect(publishResponse.body.data.status).toBe('published');
    console.log('✅ Evaluación publicada');

    // Paso 10: Presentar evaluación (con puntaje aprobatorio)
    console.log('🎯 Paso 10: Presentando evaluación...');
    const submissionResponse = await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluationId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: testData.evaluation.questions.map((q, i) => ({
          questionIndex: i,
          answer: q.correctAnswer // Todas correctas
        })),
        timeSpent: 45
      });
    
    expect(submissionResponse.status).toBe(201);
    expect(submissionResponse.body.data.passed).toBe(true);
    expect(submissionResponse.body.data.score).toBe(100);
    console.log('✅ Evaluación presentada - Puntaje:', submissionResponse.body.data.score);

    // Paso 11: Verificar certificado
    console.log('🏆 Paso 11: Verificando certificado...');
    const certificateResponse = await request(EVALUATION_SERVICE_URL)
      .get(`/api/certificates/course/${courseId}/student/me`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(certificateResponse.status).toBe(200);
    expect(certificateResponse.body.data).toHaveProperty('certificateNumber');
    expect(certificateResponse.body.data.studentName).toBe(testData.student.name);
    console.log('✅ Certificado generado:', certificateResponse.body.data.certificateNumber);

    // Paso 12: Verificar progreso actualizado
    console.log('📈 Paso 12: Verificando progreso...');
    const progressResponse = await request(COURSE_SERVICE_URL)
      .get(`/api/enrollments/${courseId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(progressResponse.status).toBe(200);
    expect(progressResponse.body.data.progress).toBeGreaterThan(0);
    console.log('✅ Progreso actualizado:', progressResponse.body.data.progress + '%');

    console.log('🎉 ¡Flujo de integración completado exitosamente!');
  }, 30000); // Timeout extendido para el flujo completo

  /**
   * Caso de prueba: Flujo con fallo en evaluación
   * Verifica el comportamiento cuando el estudiante no aprueba
   */
  it('debe manejar correctamente el flujo cuando el estudiante no aprueba', async () => {
    // Crear una nueva evaluación difícil
    const difficultEvaluation = {
      title: 'Evaluación Difícil de Integración',
      description: 'Evaluación diseñada para ser reprobada',
      type: 'multiple-choice',
      timeLimit: 30,
      passingScore: 90, // Muy alto
      totalQuestions: 10,
      questions: Array.from({ length: 10 }, (_, i) => ({
        question: `Pregunta difícil ${i + 1}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        points: 10
      }))
    };

    // Crear y publicar evaluación
    const evaluation = await createEvaluation(instructorToken, courseId, difficultEvaluation);
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluation._id}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);

    // Presentar con bajo puntaje
    const submissionResponse = await request(EVALUATION_SERVICE_URL)
      .post(`/api/evaluations/${evaluation._id}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: difficultEvaluation.questions.map((q, i) => ({
          questionIndex: i,
          answer: i % 2 === 0 ? q.correctAnswer : 1 // Solo la mitad correctas
        })),
        timeSpent: 20
      });

    expect(submissionResponse.status).toBe(201);
    expect(submissionResponse.body.data.passed).toBe(false);
    expect(submissionResponse.body.data.score).toBe(50); // 5 de 10 correctas

    // Verificar que no se generó certificado
    const certificateResponse = await request(EVALUATION_SERVICE_URL)
      .get(`/api/certificates/course/${courseId}/evaluation/${evaluation._id}/student/me`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(certificateResponse.status).toBe(404);
  });
});

/**
 * Suite de pruebas: Escenarios de error y recuperación
 */
describe('Escenarios de Error y Recuperación', () => {
  /**
   * Caso de prueba: Servicio de cursos caído
   * Verifica el comportamiento cuando el servicio de cursos no está disponible
   */
  it('debe manejar gracefulmente cuando el servicio de cursos no responde', async () => {
    // Simular un timeout del servicio de cursos
    // En un entorno real, podríamos usar un mock o proxy
    
    const studentToken = await getAuthToken(testData.student);
    
    // Intentar acceder a un curso con servicio caído
    // Esto debería manejarse con un mensaje de error apropiado
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .timeout(1000); // Timeout corto para simular servicio caído
    
    // El comportamiento exacto depende de la implementación
    // Podría ser un 503 Service Unavailable o un timeout
    expect([503, 408]).toContain(response.status);
  });

  /**
   * Caso de prueba: Token expirado durante flujo
   * Verifica que el sistema maneje tokens expirados apropiadamente
   */
  it('debe manejar token expirado durante el flujo', async () => {
    // Obtener un token
    const token = await getAuthToken(testData.student);
    
    // En un entorno real, esperaríamos a que expire o usaríamos un token pre-expirado
    // Para esta prueba, simulamos un token inválido
    const invalidToken = token + 'expired';
    
    // Intentar usar token expirado
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/courses')
      .set('Authorization', `Bearer ${invalidToken}`);
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  /**
   * Caso de prueba: Datos inconsistentes entre servicios
   * Verifica que el sistema detecte y maneje inconsistencias de datos
   */
  it('debe detectar y manejar datos inconsistentes entre servicios', async () => {
    // Crear un curso
    const instructorToken = await getAuthToken(testData.instructor);
    const course = await createFullCourse(instructorToken, testData.course);
    
    // Intentar crear una evaluación para un curso que no existe
    // (simulando una inconsistencia de datos)
    const fakeCourseId = '000000000000000000000000';
    
    const response = await request(EVALUATION_SERVICE_URL)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        courseId: fakeCourseId,
        title: 'Evaluación para curso inexistente',
        type: 'multiple-choice',
        questions: []
      });
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});

/**
 * Suite de pruebas: Concurrencia y rendimiento
 */
describe('Pruebas de Concurrencia y Rendimiento', () => {
  /**
   * Caso de prueba: Múltiples inscripciones simultáneas
   * Verifica que el sistema maneje correctamente inscripciones concurrentes
   */
  it('debe manejar múltiples inscripciones simultáneas sin conflictos', async () => {
    // Crear curso
    const instructorToken = await getAuthToken(testData.instructor);
    const course = await createFullCourse(instructorToken, testData.course);
    
    // Crear múltiples estudiantes
    const students = Array.from({ length: 5 }, (_, i) => ({
      email: `concurrent.student${i}@eduplus.com`,
      password: 'TestPassword123!',
      name: `Concurrent Student ${i}`,
      role: 'student'
    }));
    
    // Registrar todos los estudiantes
    const studentTokens = await Promise.all(
      students.map(async (student) => {
        await registerUser(student);
        return getAuthToken(student);
      })
    );
    
    // Intentar inscripciones simultáneas
    const enrollmentPromises = studentTokens.map(token =>
      enrollInCourse(token, course._id)
    );
    
    const results = await Promise.all(enrollmentPromises);
    
    // Verificar que todas las inscripciones fueron exitosas
    results.forEach((result, index) => {
      expect(result).toHaveProperty('_id');
      expect(result.status).toBe('active');
    });
    
    // Verificar que no hay duplicados
    const enrollmentIds = results.map(r => r._id);
    const uniqueIds = new Set(enrollmentIds);
    expect(uniqueIds.size).toBe(enrollmentIds.length);
  });

  /**
   * Caso de prueba: Carga de evaluaciones concurrentes
   * Verifica el rendimiento bajo carga de presentaciones simultáneas
   */
  it('debe manejar presentaciones de evaluación concurrentes', async () => {
    // Crear ambiente completo
    const instructorToken = await getAuthToken(testData.instructor);
    const course = await createFullCourse(instructorToken, testData.course);
    
    // Crear evaluación
    const evaluation = await createEvaluation(instructorToken, course._id, testData.evaluation);
    await request(EVALUATION_SERVICE_URL)
      .put(`/api/evaluations/${evaluation._id}/publish`)
      .set('Authorization', `Bearer ${instructorToken}`);
    
    // Crear múltiples estudiantes inscritos
    const students = Array.from({ length: 10 }, (_, i) => ({
      email: `load.test${i}@eduplus.com`,
      password: 'TestPassword123!',
      name: `Load Test Student ${i}`,
      role: 'student'
    }));
    
    const studentTokens = await Promise.all(
      students.map(async (student) => {
        await registerUser(student);
        const token = await getAuthToken(student);
        await enrollInCourse(token, course._id);
        return token;
      })
    );
    
    // Presentar evaluaciones simultáneamente
    const startTime = Date.now();
    const submissionPromises = studentTokens.map(token =>
      request(EVALUATION_SERVICE_URL)
        .post(`/api/evaluations/${evaluation._id}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          answers: testData.evaluation.questions.map((q, i) => ({
            questionIndex: i,
            answer: q.correctAnswer
          })),
          timeSpent: 30
        })
    );
    
    const results = await Promise.all(submissionPromises);
    const endTime = Date.now();
    
    // Verificar que todas las presentaciones fueron exitosas
    results.forEach(result => {
      expect(result.status).toBe(201);
      expect(result.body.data.passed).toBe(true);
    });
    
    // Verificar tiempo de respuesta (debe ser razonable)
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(10000); // Menos de 10 segundos para 10 presentaciones
    
    console.log(`⏱️  Tiempo total para 10 presentaciones concurrentes: ${totalTime}ms`);
  });
});

/**
 * Notas adicionales para el equipo de desarrollo:
 * 
 * 1. Configuración de entorno para pruebas de integración:
 *    - Usar base de datos de pruebas separada
 *    - Configurar timeouts apropiados para pruebas de rendimiento
 *    - Considerar uso de mocks para servicios externos
 * 
 * 2. Mejores prácticas para pruebas de integración:
 *    - Ejecutar pruebas en orden específico si hay dependencias
 *    - Limpiar datos después de cada suite de pruebas
 *    - Usar transacciones de base de datos cuando sea posible
 *    - Implementar reintentos para pruebas flaky
 * 
 * 3. Monitoreo y observabilidad:
 *    - Registrar tiempos de respuesta de cada servicio
 *    - Monitorear errores y excepciones durante pruebas
 *    - Verificar logs de todos los servicios
 *    - Usar herramientas de APM para análisis detallado
 * 
 * 4. Escenarios adicionales a considerar:
 *    - Pruebas de caos (chaos engineering)
 *    - Simulación de degradación de servicios
 *    - Pruebas de recuperación de desastres
 *    - Validación de consistencia eventual
 * 
 * 5. Automatización y CI/CD:
 *    - Integrar pruebas en pipeline de CI/CD
 *    - Ejecutar pruebas en diferentes entornos
 *    - Generar reportes de cobertura
 *    - Alertas automáticas en caso de fallos
 */