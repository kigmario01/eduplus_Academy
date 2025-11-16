/**
 * Pruebas de Integración - Servicio de Cursos
 * 
 * Este archivo contiene pruebas que verifican la funcionalidad completa del
 * servicio de cursos, incluyendo creación, actualización, inscripción y
 * gestión de contenidos.
 * 
 * @module course-integration
 * @requires supertest
 * @requires mongoose (si aplica)
 */

const request = require('supertest');

// URLs de los servicios
const AUTH_SERVICE_URL = process.env.TEST_AUTH_SERVICE_URL || 'http://localhost:4000';
const COURSE_SERVICE_URL = process.env.TEST_COURSE_SERVICE_URL || 'http://localhost:5003';

/**
 * Datos de prueba para cursos
 * Incluye diferentes tipos de cursos para probar varios escenarios
 */
const testCourses = {
  programming: {
    title: 'Introducción a JavaScript',
    description: 'Curso básico de JavaScript para principiantes',
    category: 'programming',
    level: 'beginner',
    duration: 120, // minutos
    price: 49.99,
    language: 'es'
  },
  design: {
    title: 'Diseño UX/UI Avanzado',
    description: 'Curso avanzado de diseño de experiencia de usuario',
    category: 'design',
    level: 'advanced',
    duration: 180,
    price: 99.99,
    language: 'es'
  },
  business: {
    title: 'Gestión de Proyectos Ágiles',
    description: 'Metodologías ágiles para la gestión de proyectos',
    category: 'business',
    level: 'intermediate',
    duration: 150,
    price: 79.99,
    language: 'es'
  }
};

/**
 * Usuarios de prueba con diferentes roles
 * Necesitamos instructores para crear cursos y estudiantes para inscribirse
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
 * @param {Object} user - Datos del usuario (email y password)
 * @returns {Promise<string>} Token JWT
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
 * Función auxiliar para crear un curso completo
 * @param {string} token - Token de autenticación del instructor
 * @param {Object} courseData - Datos del curso
 * @returns {Promise<Object>} Curso creado
 */
async function createCourse(token, courseData) {
  const response = await request(COURSE_SERVICE_URL)
    .post('/api/courses')
    .set('Authorization', `Bearer ${token}`)
    .send(courseData);
  
  return response.body;
}

/**
 * Suite de pruebas: Gestión de cursos por instructores
 * Verifica que los instructores puedan crear y gestionar cursos
 */
describe('POST /api/courses - Creación de cursos', () => {
  let instructorToken;

  beforeAll(async () => {
    // Preparar: Obtener token de instructor
    instructorToken = await getAuthToken(testUsers.instructor);
  });

  /**
   * Caso de prueba: Creación exitosa de curso
   * Verifica que un instructor pueda crear un curso completo
   */
  it('debe permitir a un instructor crear un curso completo', async () => {
    // Arrange: Datos del curso
    const courseData = {
      ...testCourses.programming,
      sections: [
        {
          title: 'Introducción',
          content: 'Bienvenidos al curso de JavaScript',
          order: 1
        },
        {
          title: 'Variables y Tipos de Datos',
          content: 'Aprendamos sobre variables en JavaScript',
          order: 2
        }
      ]
    };

    // Act: Crear curso
    const response = await request(COURSE_SERVICE_URL)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(courseData)
      .expect('Content-Type', /json/);

    // Assert: Verificar curso creado
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('title', courseData.title);
    expect(response.body.data).toHaveProperty('instructor');
    expect(response.body.data.sections).toHaveLength(2);
    expect(response.body.data.status).toBe('draft'); // Los cursos nuevos deben estar en borrador
  });

  /**
   * Caso de prueba: Validación de campos requeridos
   * Verifica que se validen los campos obligatorios
   */
  it('debe validar campos requeridos al crear curso', async () => {
    // Arrange: Datos incompletos
    const incompleteData = {
      title: 'Curso sin descripción'
      // Falta description, category, level, etc.
    };

    // Act: Intentar crear curso
    const response = await request(COURSE_SERVICE_URL)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send(incompleteData);

    // Assert: Verificar errores de validación
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  /**
   * Caso de prueba: Rechazo de estudiante intentando crear curso
   * Verifica que solo instructores puedan crear cursos
   */
  it('debe rechazar que un estudiante cree un curso', async () => {
    // Arrange: Obtener token de estudiante
    const studentToken = await getAuthToken(testUsers.student);

    // Act: Intentar crear curso como estudiante
    const response = await request(COURSE_SERVICE_URL)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(testCourses.programming);

    // Assert: Verificar rechazo por permisos
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });
});

/**
 * Suite de pruebas: Consulta de cursos
 * Verifica que los usuarios puedan consultar cursos disponibles
 */
describe('GET /api/courses - Consulta de cursos', () => {
  let instructorToken;
  let createdCourseId;

  beforeAll(async () => {
    // Preparar: Crear un curso para pruebas de consulta
    instructorToken = await getAuthToken(testUsers.instructor);
    const courseResponse = await createCourse(instructorToken, testCourses.programming);
    createdCourseId = courseResponse.data._id;
  });

  /**
   * Caso de prueba: Listar todos los cursos
   * Verifica que se puedan obtener todos los cursos disponibles
   */
  it('debe listar todos los cursos disponibles', async () => {
    // Act: Consultar cursos
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/courses')
      .expect('Content-Type', /json/);

    // Assert: Verificar respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Verificar estructura de datos
    const course = response.body.data[0];
    expect(course).toHaveProperty('_id');
    expect(course).toHaveProperty('title');
    expect(course).toHaveProperty('description');
    expect(course).toHaveProperty('instructor');
    expect(course).toHaveProperty('category');
  });

  /**
   * Caso de prueba: Filtrar cursos por categoría
   * Verifica que se puedan filtrar cursos por categoría
   */
  it('debe filtrar cursos por categoría', async () => {
    // Act: Consultar cursos por categoría
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/courses?category=programming')
      .expect('Content-Type', /json/);

    // Assert: Verificar filtro
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar que todos los cursos sean de la categoría solicitada
    response.body.data.forEach(course => {
      expect(course.category).toBe('programming');
    });
  });

  /**
   * Caso de prueba: Obtener detalles de un curso específico
   * Verifica que se puedan obtener los detalles completos de un curso
   */
  it('debe obtener detalles de un curso específico', async () => {
    // Act: Consultar curso por ID
    const response = await request(COURSE_SERVICE_URL)
      .get(`/api/courses/${createdCourseId}`)
      .expect('Content-Type', /json/);

    // Assert: Verificar detalles
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id', createdCourseId);
    expect(response.body.data).toHaveProperty('sections');
    expect(response.body.data).toHaveProperty('instructor');
    
    // Verificar que se incluyan los detalles del instructor
    expect(response.body.data.instructor).toHaveProperty('name');
    expect(response.body.data.instructor).toHaveProperty('email');
  });
});

/**
 * Suite de pruebas: Inscripción de estudiantes
 * Verifica que los estudiantes puedan inscribirse en cursos
 */
describe('POST /api/enrollments - Inscripción en cursos', () => {
  let studentToken;
  let courseId;

  beforeAll(async () => {
    // Preparar: Crear curso y obtener token de estudiante
    const instructorToken = await getAuthToken(testUsers.instructor);
    const courseResponse = await createCourse(instructorToken, testCourses.programming);
    courseId = courseResponse.data._id;
    
    studentToken = await getAuthToken(testUsers.student);
  });

  /**
   * Caso de prueba: Inscripción exitosa en curso
   * Verifica que un estudiante pueda inscribirse en un curso
   */
  it('debe permitir a un estudiante inscribirse en un curso', async () => {
    // Act: Inscribirse en curso
    const response = await request(COURSE_SERVICE_URL)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        courseId: courseId
      })
      .expect('Content-Type', /json/);

    // Assert: Verificar inscripción
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('student');
    expect(response.body.data).toHaveProperty('course');
    expect(response.body.data.status).toBe('active');
  });

  /**
   * Caso de prueba: Prevenir inscripción duplicada
   * Verifica que un estudiante no pueda inscribirse dos veces en el mismo curso
   */
  it('debe prevenir inscripción duplicada', async () => {
    // Act: Intentar inscribirse nuevamente
    const response = await request(COURSE_SERVICE_URL)
      .post('/api/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        courseId: courseId
      });

    // Assert: Verificar error de duplicado
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  });

  /**
   * Caso de prueba: Verificar progreso del estudiante
   * Verifica que se pueda consultar el progreso en el curso
   */
  it('debe mostrar el progreso del estudiante en el curso', async () => {
    // Act: Consultar progreso
    const response = await request(COURSE_SERVICE_URL)
      .get(`/api/enrollments/${courseId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect('Content-Type', /json/);

    // Assert: Verificar progreso
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('progress');
    expect(response.body.data.progress).toBeGreaterThanOrEqual(0);
    expect(response.body.data.progress).toBeLessThanOrEqual(100);
  });
});

/**
 * Suite de pruebas: Gestión de categorías
 * Verifica la funcionalidad de categorías de cursos
 */
describe('GET /api/categories - Gestión de categorías', () => {
  /**
   * Caso de prueba: Listar todas las categorías
   * Verifica que se puedan obtener todas las categorías disponibles
   */
  it('debe listar todas las categorías de cursos', async () => {
    // Act: Consultar categorías
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/categories')
      .expect('Content-Type', /json/);

    // Assert: Verificar respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Verificar estructura de categoría
    const category = response.body.data[0];
    expect(category).toHaveProperty('_id');
    expect(category).toHaveProperty('name');
    expect(category).toHaveProperty('description');
    expect(category).toHaveProperty('courseCount');
  });

  /**
   * Caso de prueba: Obtener cursos por categoría
   * Verifica que se puedan obtener cursos filtrados por categoría
   */
  it('debe obtener cursos filtrados por nombre de categoría', async () => {
    // Act: Consultar cursos por categoría
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/categories/programming/courses')
      .expect('Content-Type', /json/);

    // Assert: Verificar respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar que todos los cursos pertenecen a la categoría
    response.body.data.forEach(course => {
      expect(course.category).toBe('programming');
    });
  });
});

/**
 * Suite de pruebas: Búsqueda y filtrado avanzado
 * Verifica funcionalidades avanzadas de búsqueda
 */
describe('GET /api/courses/search - Búsqueda avanzada', () => {
  /**
   * Caso de prueba: Búsqueda por texto
   * Verifica que se puedan buscar cursos por palabras clave
   */
  it('debe buscar cursos por texto en título y descripción', async () => {
    // Act: Buscar cursos con texto
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/courses/search?q=JavaScript')
      .expect('Content-Type', /json/);

    // Assert: Verificar resultados de búsqueda
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar que los resultados contengan el término de búsqueda
    response.body.data.forEach(course => {
      const searchTerm = 'javascript';
      const courseText = `${course.title} ${course.description}`.toLowerCase();
      expect(courseText).toContain(searchTerm);
    });
  });

  /**
   * Caso de prueba: Filtro combinado
   * Verifica que se puedan aplicar múltiples filtros simultáneamente
   */
  it('debe aplicar filtros combinados (categoría, nivel, precio)', async () => {
    // Act: Aplicar filtros combinados
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/courses?category=programming&level=beginner&priceMin=0&priceMax=100')
      .expect('Content-Type', /json/);

    // Assert: Verificar filtros aplicados
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verificar que todos los cursos cumplan con los filtros
    response.body.data.forEach(course => {
      expect(course.category).toBe('programming');
      expect(course.level).toBe('beginner');
      expect(course.price).toBeGreaterThanOrEqual(0);
      expect(course.price).toBeLessThanOrEqual(100);
    });
  });

  /**
   * Caso de prueba: Ordenamiento de resultados
   * Verifica que se puedan ordenar los cursos por diferentes criterios
   */
  it('debe ordenar cursos por precio (ascendente y descendente)', async () => {
    // Test orden ascendente
    const ascResponse = await request(COURSE_SERVICE_URL)
      .get('/api/courses?sortBy=price&sortOrder=asc');
    
    expect(ascResponse.status).toBe(200);
    const ascPrices = ascResponse.body.data.map(course => course.price);
    const sortedAsc = [...ascPrices].sort((a, b) => a - b);
    expect(ascPrices).toEqual(sortedAsc);

    // Test orden descendente
    const descResponse = await request(COURSE_SERVICE_URL)
      .get('/api/courses?sortBy=price&sortOrder=desc');
    
    expect(descResponse.status).toBe(200);
    const descPrices = descResponse.body.data.map(course => course.price);
    const sortedDesc = [...descPrices].sort((a, b) => b - a);
    expect(descPrices).toEqual(sortedDesc);
  });
});

/**
 * Suite de pruebas: Paginación
 * Verifica que la paginación funcione correctamente
 */
describe('GET /api/courses - Paginación', () => {
  /**
   * Caso de prueba: Paginación básica
   * Verifica que se puedan obtener resultados paginados
   */
  it('debe paginar resultados correctamente', async () => {
    // Act: Solicitar página específica
    const response = await request(COURSE_SERVICE_URL)
      .get('/api/courses?page=1&limit=5')
      .expect('Content-Type', /json/);

    // Assert: Verificar paginación
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeLessThanOrEqual(5);
    
    // Verificar metadata de paginación
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page', 1);
    expect(response.body.pagination).toHaveProperty('limit', 5);
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('pages');
  });

  /**
   * Caso de prueba: Navegación entre páginas
   * Verifica que las páginas sean consistentes
   */
  it('debe mantener consistencia entre páginas', async () => {
    // Obtener página 1
    const page1 = await request(COURSE_SERVICE_URL)
      .get('/api/courses?page=1&limit=2');
    
    // Obtener página 2
    const page2 = await request(COURSE_SERVICE_URL)
      .get('/api/courses?page=2&limit=2');
    
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    
    // Verificar que no haya duplicados entre páginas
    const page1Ids = page1.body.data.map(course => course._id);
    const page2Ids = page2.body.data.map(course => course._id);
    
    const duplicates = page1Ids.filter(id => page2Ids.includes(id));
    expect(duplicates).toHaveLength(0);
  });
});

/**
 * Notas adicionales para el equipo de desarrollo:
 * 
 * 1. Configuración de base de datos de pruebas:
 *    - Usar base de datos separada para pruebas de integración
 *    - Implementar limpieza de datos después de cada suite
 *    - Considerar usar transacciones para rollback automático
 * 
 * 2. Mocks y stubs recomendados:
 *    - Servicios de almacenamiento de archivos (S3, Cloudinary)
 *    - Servicios de notificación (email, SMS)
 *    - APIs de pago (Stripe, PayPal)
 * 
 * 3. Pruebas de rendimiento:
 *    - Implementar pruebas de carga para endpoints populares
 *    - Verificar tiempos de respuesta bajo diferentes cargas
 *    - Probar comportamiento con grandes volúmenes de datos
 * 
 * 4. Casos de prueba adicionales sugeridos:
 *    - Actualización de cursos existentes
 *    - Eliminación de cursos (soft delete)
 *    - Gestión de archivos multimedia
 *    - Comentarios y valoraciones de cursos
 *    - Estadísticas y analytics de cursos
 * 
 * 5. Seguridad en pruebas:
 *    - Verificar que no se exponga información sensible
 *    - Probar límites de rate limiting
 *    - Validar sanitización de entradas
 *    - Verificar permisos y roles correctamente
 */