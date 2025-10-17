# 🚀 Guía de Despliegue - EduPlus Academy

Esta guía te ayudará a desplegar el proyecto completo en producción con Render y Neon Database.

## 📋 Prerrequisitos

- Cuenta en [Render](https://render.com)
- Base de datos en [Neon](https://neon.tech)
- Cuenta en [Cloudinary](https://cloudinary.com)
- Repositorio en GitHub

## 🗄️ 1. Configuración de Base de Datos (Neon)

### 1.1 Ejecutar Migraciones

```bash
# Navegar al directorio de scripts
cd scripts

# Instalar dependencias
npm install

# Configurar variable de entorno
export DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Ejecutar migraciones
npm run migrate
```

### 1.2 Verificar Tablas Creadas

Las siguientes tablas serán creadas:
- `course_categories`
- `courses`
- `course_sections`
- `course_lessons`
- `course_enrollments`
- `lesson_progress`
- `course_reviews`
- `conversations`
- `conversation_participants`
- `messages`
- `notifications`

## 🔧 2. Despliegue de Servicios en Render

### 2.1 Auth Service (Ya configurado)

El `auth-service` ya está configurado para desplegarse automáticamente.

### 2.2 Course Service (Nuevo)

1. **Crear nuevo Web Service en Render:**
   - Conectar repositorio GitHub
   - Seleccionar rama `main`
   - Root Directory: `services/course-service`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Configurar Variables de Entorno:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   MAX_FILE_SIZE=10485760
   AUTH_SERVICE_URL=https://your-auth-service.onrender.com
   ```

3. **Configurar Health Check:**
   - Health Check Path: `/health`

## 🌐 3. Configuración del Frontend

### 3.1 Variables de Entorno en Vercel

Configurar en el dashboard de Vercel:

```
VITE_AUTH_SERVICE_URL=https://your-auth-service.onrender.com
VITE_COURSE_SERVICE_URL=https://your-course-service.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## 🔄 4. Configuración de GitHub Actions

### 4.1 Secrets del Repositorio

Agregar en GitHub Settings > Secrets and variables > Actions:

```
# Render
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID_COURSE=your-course-service-id

# Vercel (ya existentes)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Auth Service (ya existentes)
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=your-frontend-url
AUTH_SERVICE_PORT=4000
```

### 4.2 Obtener Service ID de Render

```bash
# Instalar Render CLI
npm install -g @render/cli

# Login
render login

# Listar servicios
render services list
```

## 🧪 5. Verificación del Despliegue

### 5.1 Verificar Servicios

1. **Auth Service:** `https://your-auth-service.onrender.com/health`
2. **Course Service:** `https://your-course-service.onrender.com/health`

### 5.2 Verificar Frontend

1. Acceder a tu dominio de Vercel
2. Verificar que las APIs respondan correctamente
3. Probar funcionalidades de autenticación y cursos

## 🔧 6. Solución de Problemas

### 6.1 Errores Comunes

**Error de CORS:**
- Verificar `CORS_ORIGIN` en variables de entorno
- Asegurar que coincida con el dominio del frontend

**Error de Base de Datos:**
- Verificar `DATABASE_URL` en Neon
- Confirmar que las migraciones se ejecutaron correctamente

**Error de Cloudinary:**
- Verificar credenciales de Cloudinary
- Confirmar configuración de upload preset

### 6.2 Logs de Render

```bash
# Ver logs en tiempo real
render logs -s your-service-id --tail
```

## 📝 7. Comandos Útiles

```bash
# Ejecutar migraciones localmente
cd scripts && npm run migrate

# Verificar estado de servicios
curl https://your-auth-service.onrender.com/health
curl https://your-course-service.onrender.com/health

# Redeploy manual
render deploy -s your-service-id
```

## 🎉 ¡Listo!

Tu aplicación EduPlus Academy ahora está completamente desplegada con:
- ✅ Frontend en Vercel
- ✅ Auth Service en Render
- ✅ Course Service en Render
- ✅ Base de datos en Neon
- ✅ Despliegue automático con GitHub Actions

---

**Nota:** Recuerda actualizar las URLs en los archivos de configuración con tus dominios reales de producción.