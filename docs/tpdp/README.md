# 📚 Documentación de Pruebas de Integración - TPDP

## 📋 Descripción General

Esta carpeta contiene documentación y ejemplos de pruebas de integración para el proyecto EduPlus Academy. Las pruebas están diseñadas para verificar la comunicación entre servicios y el flujo completo de operaciones.

## 📁 Estructura de Archivos

```
docs/tpdp/
├── README.md                           # Este archivo
├── integration-tests.md               # Documentación general de pruebas
├── test-examples/                     # Ejemplos de pruebas de integración
│   ├── auth-integration.test.js      # Pruebas del servicio de autenticación
│   ├── course-integration.test.js    # Pruebas del servicio de cursos
│   ├── evaluation-integration.test.js # Pruebas del servicio de evaluaciones
│   └── service-integration.test.js   # Pruebas de integración entre servicios
└── setup/                            # Archivos de configuración y utilidades
    ├── test-helpers.js               # Funciones auxiliares para pruebas
    └── test-data.js                  # Datos de prueba predefinidos
```

## 🚀 Cómo Ejecutar las Pruebas

### Requisitos Previos

1. **Servicios ejecutándose**: Asegúrate de que todos los servicios estén ejecutándose:
   ```bash
   # Opción 1: Con Docker Compose
   docker-compose up -d
   
   # Opción 2: Manualmente (en terminales separadas)
   cd services/auth-service && npm run dev
   cd services/course-service && npm run dev
   cd services/evaluation-service && npm run dev
   ```

2. **Base de datos de pruebas**: Configura una base de datos separada para pruebas:
   ```bash
   # PostgreSQL
   createdb eduplus_test
   
   # MongoDB (si usas)
   # Las colecciones se crearán automáticamente
   ```

3. **Variables de entorno**: Configura las variables de entorno para pruebas:
   ```bash
   # Crear archivo .env.test en la raíz
   cp .env.example .env.test
   
   # Editar .env.test con tus configuraciones de prueba
   ```

### Instalación de Dependencias

```bash
# Instalar dependencias principales
npm install

# Instalar dependencias de prueba
npm install --save-dev jest supertest @types/jest

# Instalar dependencias en cada servicio
cd services/auth-service && npm install
cd services/course-service && npm install
cd services/evaluation-service && npm install
```

### Ejecución de Pruebas

```bash
# Todas las pruebas de integración
npm run test:integration

# Pruebas específicas por servicio
npm run test:auth:integration
npm run test:courses:integration
npm run test:evaluation:integration

# Pruebas con cobertura
npm run test:integration:coverage

# Pruebas en modo watch (para desarrollo)
npm run test:integration:watch

# Pruebas con logs detallados
DEBUG=test:* npm run test:integration
```

## 🧪 Tipos de Pruebas

### 1. Pruebas de Autenticación (`auth-integration.test.js`)
- ✅ Registro de usuarios
- ✅ Login con credenciales válidas/inválidas
- ✅ Validación de tokens JWT
- ✅ Recuperación de contraseña
- ✅ Cierre de sesión

### 2. Pruebas de Cursos (`course-integration.test.js`)
- ✅ Creación de cursos por instructores
- ✅ Consulta y filtrado de cursos
- ✅ Inscripción de estudiantes
- ✅ Gestión de categorías
- ✅ Búsqueda y paginación

### 3. Pruebas de Evaluación (`evaluation-integration.test.js`)
- ✅ Creación de evaluaciones por instructores
- ✅ Publicación de evaluaciones
- ✅ Presentación de evaluaciones por estudiantes
- ✅ Calificación automática
- ✅ Generación de certificados

### 4. Pruebas de Integración de Servicios (`service-integration.test.js`)
- ✅ Flujo completo: Registro → Curso → Evaluación → Certificado
- ✅ Manejo de errores entre servicios
- ✅ Pruebas de concurrencia
- ✅ Rendimiento bajo carga

## 📊 Métricas de Calidad

### Cobertura Objetivo
- **Servicios individuales**: 80%
- **Integraciones críticas**: 100%
- **Flujos completos**: 95%

### Tiempos de Respuesta Esperados
- **Autenticación**: < 200ms
- **Operaciones de cursos**: < 500ms
- **Evaluaciones**: < 1s
- **Generación de certificados**: < 2s

## 🔧 Utilidades de Prueba

### Test Helpers (`setup/test-helpers.js`)
Funciones auxiliares para simplificar la escritura de pruebas:

```javascript
// Generar datos de prueba
const userData = generateUserData({ role: 'instructor' });
const courseData = generateCourseData({ category: 'programming' });

// Crear usuarios completos
const instructor = await createCompleteUser(userData);

// Flujos completos
const course = await createCourse(instructor.token, courseData);
const evaluation = await createEvaluation(instructor.token, course._id, evalData);
```

### Test Data (`setup/test-data.js`)
Conjuntos de datos predefinidos para diferentes escenarios:

```javascript
// Usuarios estándar
STANDARD_USERS.admin
STANDARD_USERS.instructor
STANDARD_USERS.student

// Cursos de prueba
STANDARD_COURSES.beginnerProgramming
STANDARD_COURSES.advancedReact

// Escenarios completos
TEST_SCENARIOS.beginnerLearningPath
TEST_SCENARIOS.instructorCreatesCourse
```

## 🐛 Debugging

### Habilitar Logs Detallados
```bash
# Ver todos los logs de prueba
DEBUG=test:* npm run test:integration

# Logs específicos por servicio
DEBUG=test:auth:* npm run test:auth:integration
DEBUG=test:courses:* npm run test:courses:integration
```

### Capturar Screenshots (Pruebas de UI)
```javascript
// En pruebas que fallen
if (test.failed) {
  await page.screenshot({ path: `failure-${test.title}.png` });
}
```

### Ver Requests/Responses
```bash
# Ver tráfico HTTP durante pruebas
DEBUG=test:requests npm run test:integration
```

## 🚀 Mejores Prácticas

### 1. Independencia de Pruebas
Cada prueba debe ser independiente y no depender del estado de otras pruebas:
```javascript
beforeEach(async () => {
  // Limpiar y preparar datos para cada prueba
  await cleanupTestData();
  await setupTestData();
});
```

### 2. Nombres Descriptivos
Usa nombres de prueba que describan claramente el comportamiento:
```javascript
it('debe rechazar login con contraseña incorrecta', async () => {
  // ... prueba
});
```

### 3. Datos de Prueba Realistas
Usa datos que representen escenarios reales del mundo real.

### 4. Manejo de Errores
Siempre verifica que los errores se manejen apropiadamente:
```javascript
try {
  await operationThatMightFail();
} catch (error) {
  expect(error.message).toContain('mensaje de error esperado');
}
```

### 5. Timeouts Apropiados
Configura timeouts según la operación:
```javascript
it('debe completar operación larga', async () => {
  // ... operación que podría tomar tiempo
}, 10000); // 10 segundos de timeout
```

## 🔍 Escenarios de Prueba Adicionales

### Casos Edge
- Usuarios con nombres extremadamente largos
- Contraseñas con caracteres especiales
- Cursos con 100+ secciones
- Evaluaciones con 0 preguntas

### Pruebas de Rendimiento
- 100 usuarios concurrentes
- 1000 requests por segundo
- Cursos con videos de gran tamaño

### Pruebas de Seguridad
- SQL Injection
- XSS (Cross-Site Scripting)
- Rate limiting
- Autorización de recursos

## 📈 Integración con CI/CD

### GitHub Actions
Las pruebas se ejecutan automáticamente en cada push:
```yaml
name: Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run integration tests
        run: npm run test:integration
```

### Reportes de Cobertura
Los reportes se generan automáticamente y se pueden ver en:
- Consola de CI/CD
- Archivos HTML en `coverage/`
- Servicios externos (Codecov, Coveralls)

## 🆘 Solución de Problemas Comunes

### "Service unavailable" en pruebas
1. Verificar que todos los servicios estén ejecutándose
2. Comprobar puertos y URLs en variables de entorno
3. Verificar logs de los servicios

### Timeouts frecuentes
1. Aumentar timeout global: `jest.setTimeout(30000)`
2. Verificar rendimiento de base de datos
3. Optimizar queries y operaciones

### Pruebas flaky (intermitentes)
1. Usar `beforeEach` para limpiar estado
2. Implementar reintentos con backoff
3. Verificar race conditions

### Datos inconsistentes
1. Usar transacciones de base de datos
2. Implementar cleanup apropiado
3. Verificar aislamiento entre pruebas

## 📞 Soporte

Si encuentras problemas con las pruebas:

1. **Verifica los logs**: Los mensajes de error suelen ser descriptivos
2. **Consulta la documentación**: Cada archivo de prueba tiene comentarios detallados
3. **Revisa el setup**: Asegúrate de que todos los servicios estén configurados correctamente
4. **Contacta al equipo**: En el canal #testing-del-equipo de Slack

## 🔄 Actualización y Mantenimiento

Esta documentación se actualiza regularmente. Para contribuir:

1. Mantén los ejemplos actualizados con los cambios del código
2. Agrega nuevos casos de prueba cuando se implementen funcionalidades
3. Documenta nuevos escenarios edge que descubras
4. Actualiza las métricas de rendimiento según cambien los requisitos

---

**Última actualización**: Noviembre 2024  
**Versión**: 1.0.0  
**Responsable**: Equipo de Calidad