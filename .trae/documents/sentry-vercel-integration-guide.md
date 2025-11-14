# Guía de Integración de Sentry con Vercel para EduPlus Academy

## 1. Descripción General

Esta guía detalla la integración de Sentry para monitoreo de errores y rendimiento en la plataforma EduPlus Academy. Sentry proporcionará seguimiento de errores en tiempo real, monitoreo de rendimiento y alertas para todos los servicios desplegados en Vercel.

## 2. Configuración de Sentry

### 2.1 Crear Proyecto en Sentry

1. **Acceder a Sentry**: <https://sentry.io>
2. **Crear nuevo proyecto**:

   * Nombre: `eduplus-academy`

   * Plataforma: `React` (para frontend)

   * Crear proyectos adicionales para cada servicio backend

### 2.2 Proyectos Recomendados

| Proyecto                   | Plataforma | Propósito                     |
| -------------------------- | ---------- | ----------------------------- |
| eduplus-frontend           | React      | Monitoreo de errores en React |
| eduplus-auth-service       | Node.js    | Errores de autenticación      |
| eduplus-course-service     | Node.js    | Errores de gestión de cursos  |
| eduplus-evaluation-service | Node.js    | Errores de evaluaciones       |

## 3. Integración Frontend (React)

### 3.1 Instalación de Dependencias

```bash
cd frontend
npm install @sentry/react @sentry/vite-plugin
```

### 3.2 Configuración de Sentry en React

**Archivo:** **`src/sentry.config.js`**

```javascript
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN no configurado');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Error filtering
    beforeSend(event, hint) {
      // Filtrar errores conocidos o de terceros
      if (event.exception) {
        const error = hint.originalException;
        if (error && error.message && error.message.includes('ResizeObserver')) {
          return null;
        }
      }
      return event;
    },
  });
}

// Error Boundary personalizado
export const SentryErrorBoundary = Sentry.ErrorBoundary;
```

### 3.3 Modificar `main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initSentry, SentryErrorBoundary } from './sentry.config.js'

// Inicializar Sentry
initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={({ error }) => (
      <div className="error-fallback">
        <h1>Algo salió mal</h1>
        <p>El equipo técnico ha sido notificado.</p>
        <button onClick={() => window.location.reload()}>Recargar página</button>
      </div>
    )}>
      <App />
    </SentryErrorBoundary>
  </React.StrictMode>,
)
```

### 3.4 Configuración de Source Maps en Vite

**Archivo:** **`vite.config.js`**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Sentry solo en producción
    mode === 'production' && sentryVitePlugin({
      org: process.env.VITE_SENTRY_ORG,
      project: process.env.VITE_SENTRY_PROJECT,
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: ['dist/**/*.map'],
      },
    }),
  ].filter(Boolean),
  build: {
    sourcemap: true,
  },
}))
```

## 4. Integración Backend Services

### 4.1 Auth Service

**Instalación:**

```bash
cd services/auth-service
npm install @sentry/node @sentry/profiling-node
```

**Archivo:** **`src/sentry.config.js`**

```javascript
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN no configurado para auth-service');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    integrations: [
      // HTTP integration para tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Express integration
      new Sentry.Integrations.Express({
        app: global.__app__, // Se configurará en server.js
      }),
      // Profiling integration
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
  });

  return Sentry;
}
```

**Modificar** **`src/server.js`:**

```javascript
import express from 'express';
import * as Sentry from '@sentry/node';
import { initSentry } from './sentry.config.js';

const app = express();
global.__app__ = app;

// Inicializar Sentry ANTES de cualquier middleware
const sentry = initSentry();

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// ... resto de middlewares y rutas ...

// The error handler must be registered before any other error middleware
app.use(Sentry.Handlers.errorHandler());

// Error handler personalizado
app.use((err, req, res, next) => {
  const errorId = Sentry.captureException(err);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error procesando la solicitud',
    errorId,
    timestamp: new Date().toISOString()
  });
});
```

### 4.2 Course Service

**Instalación:**

```bash
cd services/course-service
npm install @sentry/node @sentry/profiling-node
```

**Configuración similar al auth service** con ajustes específicos:

```javascript
// src/sentry.config.js
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    // Tags específicos del servicio
    tags: {
      service: 'course-service',
      version: process.env.npm_package_version,
    },
  });
}
```

### 4.3 Evaluation Service

**Instalación:**

```bash
cd services/evaluation-service
npm install @sentry/node @sentry/profiling-node
```

**Configuración específica para evaluaciones:**

```javascript
// src/sentry.config.js
export function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    beforeSend(event) {
      // Filtrar información sensible de evaluaciones
      if (event.request && event.request.data) {
        delete event.request.data.answers;
        delete event.request.data.studentData;
      }
      return event;
    },
  });
}
```

## 5. Variables de Entorno para Vercel

### 5.1 Frontend Environment Variables

```bash
# .env.production
VITE_SENTRY_DSN=https://[key]@o[org].ingest.sentry.io/[project]
VITE_SENTRY_ORG=tu-organizacion
VITE_SENTRY_PROJECT=eduplus-frontend
VITE_SENTRY_AUTH_TOKEN=[auth-token]
VITE_ENVIRONMENT=production
```

### 5.2 Backend Services Environment Variables

Para cada servicio en Vercel:

```bash
# Variables en Vercel Dashboard
SENTRY_DSN=https://[key]@o[org].ingest.sentry.io/[project]
NODE_ENV=production
```

## 6. Configuración de Alertas

### 6.1 Alertas Recomendadas

1. **Errores por minuto > 10**
2. **Error rate > 5%**
3. **Performance P95 > 2s**
4. **New issues**
5. **Regresiones**

### 6.2 Canales de Notificación

* **Email**: <equipo-tecnico@eduplus.com>

* **Slack**: #alerts-sentry

* **Webhook**: Para integraciones personalizadas

## 7. Métricas y Dashboards

### 7.1 Métricas Clave a Monitorear

| Métrica           | Descripción                        | Umbral de Alerta |
| ----------------- | ---------------------------------- | ---------------- |
| Error Rate        | Porcentaje de requests con errores | > 5%             |
| P95 Response Time | Tiempo de respuesta del 95%        | > 2s             |
| Apdex Score       | Satisfacción del usuario           | < 0.7            |
| Sessions Crashed  | Sesiones con errores críticos      | > 1%             |

### 7.2 Dashboards Personalizados

1. **Overview Dashboard**: Métricas generales de todos los servicios
2. **Frontend Performance**: Web vitals, page load times
3. **Backend Health**: Error rates, response times por endpoint
4. **User Experience**: Session replay, user journeys

## 8. Testing y Validación

### 8.1 Test de Error Tracking

```javascript
// Test endpoint para auth-service
app.get('/debug-sentry', (req, res) => {
  throw new Error('Test Sentry integration');
});
```

### 8.2 Test de Performance

```javascript
// Test de rendimiento
app.get('/debug-performance', async (req, res) => {
  const transaction = Sentry.startTransaction({
    op: 'test',
    name: 'Performance Test',
  });
  
  // Simular trabajo
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  transaction.finish();
  res.json({ status: 'ok' });
});
```

## 9. Best Practices

### 9.1 Gestión de Errores

* Siempre capturar errores asíncronos

* Usar contexto adicional con `Sentry.setContext`

* Filtrar información sensible con `beforeSend`

* Agrupar errores similares correctamente

### 9.2 Performance

* Configurar sample rates apropiados (10% en producción)

* Usar sampling para reducir overhead

* Monitorear el overhead de Sentry mismo

### 9.3 Seguridad

* Nunca exponer DSN del lado del cliente

* Filtrar datos sensibles en beforeSend

* Usar auth tokens con permisos mínimos

## 10. Troubleshooting

### 10.1 Problemas Comunes

1. **Source maps no cargan**: Verificar auth tokens y paths
2. **Errores no aparecen**: Verificar DSN y sample rates
3. **Performance overhead**: Ajustar sample rates
4. **Alertas no funcionan**: Verificar reglas y canales

### 10.2 Comandos de Debug

```bash
# Verificar conexión con Sentry
npx @sentry/wizard --debug

# Test de source maps
npx sentry-cli sourcemaps explain [event-id]
```

## 11. Mantenimiento

### 11.1 Tareas Regulares

* Revisar alertas semanalmente

* Limpiar issues antiguos mensualmente

* Actualizar SDKs trimestralmente

* Revisar dashboards de tendencias

### 11.2 Métricas de Éxito

* Reducción del error rate mensual

* Tiempo de detección de errores < 5 minutos

* Tiempo de resolución de errores < 24 horas

* Cobertura de errores críticos > 95%

***

Esta guía proporciona una integración completa de Sentry para monitorear y mejorar la calidad de tu plataforma EduPlus Academy en Vercel.
