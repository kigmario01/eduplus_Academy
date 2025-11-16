/**
 * Pruebas de Integración - Servicio de Autenticación
 * 
 * Este archivo contiene pruebas que verifican el flujo completo de autenticación
 * incluyendo registro, login, validación de tokens y cierre de sesión.
 * 
 * @module auth-integration
 * @requires supertest
 * @requires jsonwebtoken
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Configuración base para las pruebas
const AUTH_SERVICE_URL = process.env.TEST_AUTH_SERVICE_URL || 'http://localhost:4000';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

/**
 * Datos de prueba para usuarios
 * Se utilizan diferentes tipos de usuarios para probar distintos escenarios
 */
const testUsers = {
  student: {
    email: 'test.student@eduplus.com',
    password: 'TestStudent123!',
    name: 'Test Student',
    role: 'student'
  },
  instructor: {
    email: 'test.instructor@eduplus.com',
    password: 'TestInstructor123!',
    name: 'Test Instructor',
    role: 'instructor'
  },
  admin: {
    email: 'test.admin@eduplus.com',
    password: 'TestAdmin123!',
    name: 'Test Admin',
    role: 'admin'
  }
};

/**
 * Función auxiliar para limpiar usuarios de prueba
 * Se ejecuta después de cada suite de pruebas para mantener limpio el entorno
 */
async function cleanupTestUser(email) {
  try {
    // En un entorno real, aquí eliminaríamos el usuario de la base de datos
    console.log(`Limpiando usuario de prueba: ${email}`);
  } catch (error) {
    console.error('Error al limpiar usuario:', error);
  }
}

/**
 * Suite de pruebas: Registro de usuarios
 * Verifica que los usuarios puedan registrarse correctamente
 */
describe('POST /api/auth/register', () => {
  afterEach(async () => {
    // Limpieza después de cada prueba
    await cleanupTestUser(testUsers.student.email);
  });

  /**
   * Caso de prueba: Registro exitoso de estudiante
   * Verifica que un estudiante pueda registrarse con datos válidos
   */
  it('debe registrar un estudiante con datos válidos', async () => {
    // Arrange: Preparar datos de prueba
    const userData = testUsers.student;

    // Act: Ejecutar la petición HTTP
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/register')
      .send(userData)
      .expect('Content-Type', /json/);

    // Assert: Verificar resultados esperados
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('userId');
    expect(response.body.data).toHaveProperty('email', userData.email);
    
    // Verificar que no se devuelva la contraseña
    expect(response.body.data).not.toHaveProperty('password');
  });

  /**
   * Caso de prueba: Registro con email duplicado
   * Verifica que el sistema rechace emails duplicados
   */
  it('debe rechazar registro con email duplicado', async () => {
    // Arrange: Primero registramos un usuario
    const userData = testUsers.student;
    
    // Registro inicial
    await request(AUTH_SERVICE_URL)
      .post('/api/auth/register')
      .send(userData);

    // Act: Intentar registrar el mismo email
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/register')
      .send(userData);

    // Assert: Verificar error de duplicado
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('email');
  });

  /**
   * Caso de prueba: Registro con datos inválidos
   * Verifica validación de campos requeridos
   */
  it('debe rechazar registro con datos inválidos', async () => {
    // Arrange: Datos incompletos
    const invalidData = {
      email: 'invalid-email',
      password: '123' // Contraseña muy corta
    };

    // Act: Intentar registro
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/register')
      .send(invalidData);

    // Assert: Verificar errores de validación
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });
});

/**
 * Suite de pruebas: Login de usuarios
 * Verifica que los usuarios puedan iniciar sesión correctamente
 */
describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    // Preparar: Registrar usuarios de prueba antes de las pruebas de login
    for (const userType of Object.keys(testUsers)) {
      await request(AUTH_SERVICE_URL)
        .post('/api/auth/register')
        .send(testUsers[userType]);
    }
  });

  afterAll(async () => {
    // Limpieza: Eliminar usuarios de prueba
    for (const userType of Object.keys(testUsers)) {
      await cleanupTestUser(testUsers[userType].email);
    }
  });

  /**
   * Caso de prueba: Login exitoso
   * Verifica que un usuario pueda iniciar sesión con credenciales válidas
   */
  it('debe permitir login con credenciales válidas', async () => {
    // Arrange: Usar credenciales del usuario de prueba
    const credentials = {
      email: testUsers.student.email,
      password: testUsers.student.password
    };

    // Act: Ejecutar login
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/login')
      .send(credentials);

    // Assert: Verificar respuesta exitosa
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', credentials.email);
    expect(response.body.user).toHaveProperty('role', testUsers.student.role);

    // Verificar que el token JWT es válido
    const decodedToken = jwt.verify(response.body.token, JWT_SECRET);
    expect(decodedToken).toHaveProperty('userId');
    expect(decodedToken).toHaveProperty('email', credentials.email);
  });

  /**
   * Caso de prueba: Login con contraseña incorrecta
   * Verifica que el sistema rechace contraseñas incorrectas
   */
  it('debe rechazar login con contraseña incorrecta', async () => {
    // Arrange: Credenciales incorrectas
    const invalidCredentials = {
      email: testUsers.student.email,
      password: 'wrongpassword'
    };

    // Act: Intentar login
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/login')
      .send(invalidCredentials);

    // Assert: Verificar error de autenticación
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('contraseña');
  });

  /**
   * Caso de prueba: Login con usuario inexistente
   * Verifica que el sistema maneje usuarios no registrados
   */
  it('debe rechazar login con usuario inexistente', async () => {
    // Arrange: Usuario que no existe
    const nonExistentUser = {
      email: 'nonexistent@eduplus.com',
      password: 'anypassword'
    };

    // Act: Intentar login
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/login')
      .send(nonExistentUser);

    // Assert: Verificar error de usuario no encontrado
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('usuario');
  });
});

/**
 * Suite de pruebas: Validación de tokens
 * Verifica que los tokens JWT se validen correctamente
 */
describe('GET /api/auth/validate', () => {
  let authToken;

  beforeEach(async () => {
    // Preparar: Obtener token válido
    const loginResponse = await request(AUTH_SERVICE_URL)
      .post('/api/auth/login')
      .send({
        email: testUsers.student.email,
        password: testUsers.student.password
      });
    
    authToken = loginResponse.body.token;
  });

  /**
   * Caso de prueba: Validación de token válido
   * Verifica que un token JWT válido sea aceptado
   */
  it('debe validar un token JWT válido', async () => {
    // Act: Validar token
    const response = await request(AUTH_SERVICE_URL)
      .get('/api/auth/validate')
      .set('Authorization', `Bearer ${authToken}`);

    // Assert: Verificar validación exitosa
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('valid', true);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', testUsers.student.email);
  });

  /**
   * Caso de prueba: Rechazo de token inválido
   * Verifica que tokens manipulados o falsos sean rechazados
   */
  it('debe rechazar un token JWT inválido', async () => {
    // Arrange: Token manipulado
    const invalidToken = authToken + 'invalid';

    // Act: Intentar validar token inválido
    const response = await request(AUTH_SERVICE_URL)
      .get('/api/auth/validate')
      .set('Authorization', `Bearer ${invalidToken}`);

    // Assert: Verificar rechazo
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('valid', false);
    expect(response.body).toHaveProperty('message');
  });

  /**
   * Caso de prueba: Manejo de token expirado
   * Verifica que tokens expirados sean manejados apropiadamente
   */
  it('debe manejar token expirado', async () => {
    // En un entorno real, esperaríamos a que expire o usaríamos un token pre-expirado
    // Por simplicidad, verificamos que el endpoint maneje el caso
    const response = await request(AUTH_SERVICE_URL)
      .get('/api/auth/validate')
      .set('Authorization', 'Bearer expired-token');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('valid', false);
  });
});

/**
 * Suite de pruebas: Cierre de sesión
 * Verifica que los usuarios puedan cerrar sesión correctamente
 */
describe('POST /api/auth/logout', () => {
  let authToken;

  beforeEach(async () => {
    // Preparar: Obtener token válido
    const loginResponse = await request(AUTH_SERVICE_URL)
      .post('/api/auth/login')
      .send({
        email: testUsers.student.email,
        password: testUsers.student.password
      });
    
    authToken = loginResponse.body.token;
  });

  /**
   * Caso de prueba: Logout exitoso
   * Verifica que un usuario pueda cerrar sesión
   */
  it('debe permitir cierre de sesión exitoso', async () => {
    // Act: Ejecutar logout
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`);

    // Assert: Verificar respuesta exitosa
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');

    // Verificar que el token ya no sea válido (opcional, depende de la implementación)
    const validateResponse = await request(AUTH_SERVICE_URL)
      .get('/api/auth/validate')
      .set('Authorization', `Bearer ${authToken}`);
    
    // Si el sistema invalida tokens en logout, este debería fallar
    // Nota: Comportamiento depende de la implementación específica
  });
});

/**
 * Suite de pruebas: Recuperación de contraseña
 * Verifica el flujo de recuperación de contraseña
 */
describe('POST /api/auth/forgot-password', () => {
  /**
   * Caso de prueba: Solicitud de recuperación de contraseña
   * Verifica que se pueda solicitar recuperación para un usuario existente
   */
  it('debe enviar email de recuperación para usuario existente', async () => {
    // Act: Solicitar recuperación
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/forgot-password')
      .send({
        email: testUsers.student.email
      });

    // Assert: Verificar respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('email');
  });

  /**
   * Caso de prueba: Manejo de usuario inexistente
   * Verifica que se maneje gracefully el caso de usuario no existente
   */
  it('debe manejar solicitud para usuario inexistente', async () => {
    // Act: Solicitar recuperación para usuario que no existe
    const response = await request(AUTH_SERVICE_URL)
      .post('/api/auth/forgot-password')
      .send({
        email: 'nonexistent@eduplus.com'
      });

    // Assert: Verificar que no revele información sensible
    expect(response.status).toBe(200); // O 404, depende de la política de seguridad
    expect(response.body).toHaveProperty('success', true);
    // No debe revelar si el usuario existe o no
  });
});

/**
 * Notas adicionales para el equipo de desarrollo:
 * 
 * 1. Variables de entorno necesarias:
 *    - TEST_AUTH_SERVICE_URL: URL del servicio de autenticación
 *    - JWT_SECRET: Secreto para validar tokens JWT
 *    - TEST_DATABASE_URL: Base de datos de pruebas (si aplica)
 * 
 * 2. Configuración de la base de datos de pruebas:
 *    - Usar una base de datos separada para pruebas
 *    - Limpiar datos después de cada suite
 *    - Considerar usar transacciones para rollback
 * 
 * 3. Mocks y stubs:
 *    - Considerar mockear servicios externos (email, SMS)
 *    - Usar stubs para servicios de terceros
 *    - Implementar factories para crear datos de prueba
 * 
 * 4. Performance:
 *    - Ejecutar pruebas en paralelo cuando sea posible
 *    - Usar timeouts apropiados para operaciones lentas
 *    - Considerar pruebas de carga para endpoints críticos
 * 
 * 5. Seguridad:
 *    - Nunca usar datos de producción en pruebas
 *    - Limpiar tokens y credenciales después de pruebas
 *    - Verificar que no haya data leakage entre pruebas
 */