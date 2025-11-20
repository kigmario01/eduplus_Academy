# 🧪 Guía de Pruebas - EduPlus Academy

Esta guía te ayudará a ejecutar las pruebas unitarias e integración del proyecto EduPlus Academy.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Tipos de Pruebas](#tipos-de-pruebas)
- [Ejecución de Pruebas](#ejecución-de-pruebas)
- [Configuración de Entorno](#configuración-de-entorno)
- [Solución de Problemas](#solución-de-problemas)

## 🔧 Requisitos Previos

Antes de ejecutar las pruebas, asegúrate de tener:

- **Node.js** (v18 o superior)
- **npm** o **pnpm** instalado
- **Docker** y **Docker Compose** (para pruebas de integración)
- El proyecto clonado y dependencias instaladas

### Instalación de Dependencias

```bash
# Instalar dependencias principales
npm install

# Instalar dependencias de cada servicio
cd services/auth-service && npm install
cd ../course-service && npm install
cd ../evaluation-service && npm install
```

## 🎯 Tipos de Pruebas

### 1. Pruebas Unitarias

Pruebas individuales de funciones y componentes de cada microservicio.

**Ubicación:** `services/*/tests/unit/`

**Ejemplos:**
- `services/auth-service/tests/unit/auth.utils.test.js`
- `services/course-service/tests/unit/course.validator.test.js`
- `services/evaluation-service/tests/unit/evaluation.utils.test.js`

### 2. Pruebas de Integración

Pruebas que verifican la comunicación entre servicios y la base de datos.

**Ubicación:** `tests/integration/`

**Ejemplos:**
- `tests/integration/services/auth-service/auth.integration.test.js`
- `tests/integration/services/course-service/course.integration.test.js`
- `tests/integration/services/evaluation-service/evaluation.integration.test.js`

## 🚀 Ejecución de Pruebas

### Pruebas Unitarias

```bash
# Ejecutar todas las pruebas unitarias
npm run test:unit

# Ejecutar pruebas de un servicio específico
cd services/auth-service && npm test
```

### Pruebas de Integración

```bash
# Ejecutar todas las pruebas de integración
npm run test:integration

# Ejecutar con más detalle
npm run test:integration -- --verbose
```

### Opciones Adicionales

```bash
# Ejecutar pruebas en modo watch
npm run test:unit -- --watch

# Ejecutar pruebas con coverage
npm run test:unit -- --coverage

# Ejecutar pruebas específicas por patrón
npm run test:unit -- --testNamePattern="auth"

# Ejecutar un archivo de prueba específico
npm run test:unit -- services/auth-service/tests/unit/auth.utils.test.js
```

## ⚙️ Configuración de Entorno

### Variables de Entorno para Pruebas

Las pruebas utilizan las siguientes variables de entorno:

```bash
# .env.example (usado en CI)
JWT_SECRET=test_secret
DATABASE_URL=postgres://postgres:postgres@postgres:5432/eduplus_test
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=eduplus_test
```

### Configuración de Base de Datos para Pruebas

Para las pruebas de integración, se utiliza Docker Compose:

```bash
# Levantar servicios para pruebas
docker-compose up -d postgres auth-service course-service evaluation-service

# Verificar que los servicios estén funcionando
curl http://localhost:4000/health   # Auth Service
curl http://localhost:3001/health   # Course Service
curl http://localhost:5005/api/evaluations/health  # Evaluation Service
```

## 🔍 Solución de Problemas

### Error: "Cannot find module"

```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "ECONNREFUSED" en pruebas de integración

```bash
# Verificar que Docker esté ejecutándose
docker ps

# Reiniciar servicios
docker-compose down
docker-compose up -d

# Verificar logs
docker-compose logs
```

### Error: "jest: command not found"

```bash
# Instalar Jest globalmente
npm install -g jest

# O usar npx
npx jest
```

### Error: "Timeout - Async callback was not invoked"

```bash
# Aumentar timeout para pruebas lentas
npm run test:integration -- --testTimeout=60000

# Verificar conectividad de red
curl -v http://localhost:4000/health
```

### Error: "Cannot use import statement outside a module"

Este error ocurre cuando Jest no está configurado correctamente para ESM:

```bash
# Asegúrate de usar el comando correcto
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

### Pruebas Fallan en CI pero Pasan Localmente

1. **Verificar versiones de Node.js:**
   ```bash
   node --version
   npm --version
   ```

2. **Limpiar caché de CI:**
   ```bash
   # En tu workflow de GitHub Actions
   - name: Clear cache
     run: |
       npm cache clean --force
       rm -rf node_modules package-lock.json
   ```

3. **Verificar variables de entorno:**
   ```bash
   # Asegúrate de que todas las variables estén definidas
   env | grep -E "(JWT_SECRET|DATABASE_URL|POSTGRES)"
   ```

## 📊 Estructura de Archivos de Pruebas

```
EduPlus_academy/
├── services/
│   ├── auth-service/
│   │   └── tests/
│   │       └── unit/
│   │           └── auth.utils.test.js
│   ├── course-service/
│   │   └── tests/
│   │       └── unit/
│   │           └── course.validator.test.js
│   └── evaluation-service/
│       └── tests/
│           └── unit/
│               └── evaluation.utils.test.js
├── tests/
│   └── integration/
│       ├── services/
│       │   ├── auth-service/
│       │   ├── course-service/
│       │   └── evaluation-service/
│       ├── jest.config.js
│       ├── jest.setup.js
│       └── package.json
└── jest.config.js (configuración principal)
```

## 🎭 Ejemplos de Uso

### Ejemplo de Prueba Unitarias

```javascript
// services/auth-service/tests/unit/auth.utils.test.js
describe('Auth Utils', () => {
  test('should validate JWT token', () => {
    const token = generateToken({ userId: 1 });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(1);
  });
});
```

### Ejemplo de Pruebas de Integración

```javascript
// tests/integration/services/auth-service/auth.integration.test.js
describe('Auth Service Integration', () => {
  test('should register and login user', async () => {
    const response = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.token).toBeDefined();
  });
});
```

## 🔗 Recursos Adicionales

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [SuperTest para pruebas HTTP](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server para pruebas](https://github.com/nodkz/mongodb-memory-server)

## 💡 Consejos

1. **Ejecuta pruebas antes de commitear:**
   ```bash
   npm run test:unit && npm run test:integration
   ```

2. **Usa mocks para pruebas unitarias:**
   ```javascript
   jest.mock('../models/user.model.js');
   ```

3. **Mantén las pruebas aisladas:** Cada prueba debe ser independiente y no depender del estado de otras pruebas.

4. **Usa nombres descriptivos:** Los nombres de las pruebas deben describir claramente qué se está probando.

---

¿Necesitas ayuda adicional? Consulta los logs del CI o abre un issue en el repositorio.