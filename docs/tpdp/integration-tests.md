# Pruebas de Integración - EduPlus Academy

## 📋 Resumen

Este documento contiene ejemplos de pruebas de integración para los servicios de EduPlus Academy. Las pruebas están diseñadas para verificar la comunicación entre servicios y el flujo completo de operaciones.

## 🧪 Tipos de Pruebas

### 1. Pruebas de Autenticación
Verifican el flujo completo de autenticación entre el frontend y el auth-service.

### 2. Pruebas de Cursos
Validan la creación, actualización y consulta de cursos en el course-service.

### 3. Pruebas de Evaluación
Comprueban el flujo de evaluaciones y certificados.

### 4. Pruebas de Integración de Servicios
Validan la comunicación entre servicios (auth → course → evaluation).

## 🚀 Ejecución de Pruebas

### Requisitos Previos
```bash
# Tener los servicios ejecutándose
docker-compose up -d

# Instalar dependencias de pruebas
npm install
```

### Comandos de Ejecución
```bash
# Todas las pruebas de integración
npm run test:integration

# Pruebas específicas por servicio
npm run test:auth:integration
npm run test:courses:integration
npm run test:evaluation:integration
```

## 📁 Estructura de Archivos

```
docs/tpdp/
├── integration-tests.md          # Este documento
├── test-examples/
│   ├── auth-integration.test.js  # Pruebas de autenticación
│   ├── course-integration.test.js # Pruebas de cursos
│   ├── evaluation-integration.test.js # Pruebas de evaluación
│   └── service-integration.test.js # Pruebas entre servicios
└── setup/
    ├── test-helpers.js            # Funciones auxiliares
    └── test-data.js              # Datos de prueba
```

## 🔍 Ejemplos de Casos de Prueba

### Caso 1: Registro y Login de Usuario
```javascript
describe('Flujo de Autenticación', () => {
  it('debe registrar un nuevo usuario y permitir login', async () => {
    // 1. Crear usuario
    // 2. Verificar email
    // 3. Hacer login
    // 4. Verificar token JWT
  });
});
```

### Caso 2: Creación de Curso por Instructor
```javascript
describe('Gestión de Cursos', () => {
  it('debe permitir a un instructor crear y publicar un curso', async () => {
    // 1. Login como instructor
    // 2. Crear curso
    // 3. Agregar secciones
    // 4. Publicar curso
    // 5. Verificar disponibilidad para estudiantes
  });
});
```

### Caso 3: Flujo Completo de Evaluación
```javascript
describe('Sistema de Evaluación', () => {
  it('debe completar el flujo de evaluación y generar certificado', async () => {
    // 1. Estudiante se inscribe en curso
    // 2. Completa evaluaciones
    // 3. Obtiene calificación
    // 4. Genera certificado
    // 5. Verifica validez del certificado
  });
});
```

## ⚙️ Configuración de Entorno de Pruebas

### Variables de Entorno para Pruebas
```bash
# .env.test
NODE_ENV=test
TEST_DATABASE_URL=postgresql://localhost:5432/eduplus_test
TEST_REDIS_URL=redis://localhost:6379/1
TEST_AUTH_SERVICE_URL=http://localhost:4000
TEST_COURSE_SERVICE_URL=http://localhost:5003
TEST_EVALUATION_SERVICE_URL=http://localhost:5005
```

### Base de Datos de Pruebas
```sql
-- Crear base de datos de pruebas
CREATE DATABASE eduplus_test;
GRANT ALL PRIVILEGES ON DATABASE eduplus_test TO test_user;
```

## 🎯 Mejores Prácticas

1. **Aislamiento**: Cada prueba debe ser independiente
2. **Limpieza**: Limpiar datos de prueba después de ejecutar
3. **Timeouts**: Configurar timeouts apropiados para operaciones asíncronas
4. **Logs**: Capturar logs para debugging
5. **Retry**: Implementar reintentos para pruebas flaky

## 🐛 Debugging

### Habilitar logs detallados
```bash
DEBUG=test:* npm run test:integration
```

### Capturar screenshots en fallos
```javascript
// En pruebas de UI
if (test.failed) {
  await page.screenshot({ path: `failure-${test.title}.png` });
}
```

## 📊 Métricas de Cobertura

Objetivos de cobertura:
- **Servicios**: 80% de cobertura de código
- **Integraciones**: 100% de flujos críticos
- **APIs**: Todos los endpoints documentados probados

## 🔗 Recursos Adicionales

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Supertest para APIs](https://github.com/visionmedia/supertest)
- [Testing Library para React](https://testing-library.com/docs/react-testing-library/intro/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)