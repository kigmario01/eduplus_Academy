# ✅ PRE-DEPLOYMENT CHECKLIST - EduPlus Academy

## 🎯 Resumen del Sistema

Este checklist valida que todo esté listo para el deployment en producción con:
- **Frontend**: Vercel
- **Auth Service**: Vercel  
- **Course Service**: Render
- **Database**: Neon PostgreSQL

---

## 📋 CHECKLIST DE VALIDACIÓN

### 1. 🗄️ Base de Datos Neon

#### ✅ Scripts Preparados:
- **Migración SQL**: `database/neon-migration-course-service.sql`
- **Script automatizado**: `scripts/migrate-neon.js`
- **Test de conexión**: `scripts/test-neon-connection.js`

#### 🔧 Comandos para ejecutar:

```bash
# 1. Instalar dependencias de scripts
cd scripts
npm install

# 2. Configurar DATABASE_URL (reemplaza con tu URL de Neon)
$env:DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"

# 3. Probar conexión
npm run test:neon

# 4. Ejecutar migraciones
npm run migrate:neon
```

#### 📊 Tablas que se crearán:
- `course_categories` - Categorías de cursos
- `courses` - Cursos principales
- `course_sections` - Secciones de cursos
- `course_lessons` - Lecciones individuales
- `course_enrollments` - Inscripciones de usuarios
- `lesson_progress` - Progreso de lecciones
- `course_reviews` - Reseñas de cursos
- `conversations` - Conversaciones/mensajería
- `conversation_participants` - Participantes en conversaciones
- `messages` - Mensajes
- `notifications` - Notificaciones

---

### 2. 🚀 GitHub Secrets Requeridos

#### Para Frontend (Vercel):
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID_FRONTEND=your_frontend_project_id
VITE_API_URL=https://your-frontend-domain.vercel.app
```

#### Para Auth Service (Vercel):
```
VERCEL_PROJECT_ID_AUTH=your_auth_project_id
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
AUTH_SERVICE_PORT=4000
```

#### Para Course Service (Render):
```
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID_COURSE=your_course_service_id
```

---

### 3. 🔧 Configuración de Servicios

#### ✅ Course Service - Variables de Entorno en Render:
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
AUTH_SERVICE_URL=https://your-auth-service.vercel.app
```

#### ✅ Frontend - Variables de Entorno en Vercel:
```
VITE_API_URL=https://your-frontend-domain.vercel.app
VITE_AUTH_SERVICE_URL=https://your-auth-service.vercel.app
VITE_COURSE_SERVICE_URL=https://your-course-service.onrender.com
VITE_APP_NAME=EduPlus Academy
VITE_APP_VERSION=1.0.0
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_key
```

---

### 4. 🎨 Nuevas Funcionalidades Incluidas

#### ✅ Sistema de Notificaciones de Actualización:
- **Componente**: `frontend/src/components/UpdateNotification.jsx`
- **Integración**: Automática en landing page
- **Funcionalidad**: 
  - Muestra información de la última actualización
  - Se genera automáticamente en cada push
  - Persistencia con localStorage
  - Animaciones suaves

#### ✅ Información de Build Automática:
- **Archivo generado**: `frontend/public/build-info.json`
- **Contenido**: Versión, commit, fecha, branch, etc.
- **Actualización**: Automática via GitHub Actions

---

### 5. 🧪 Tests de Validación

#### Antes del Push:
```bash
# 1. Test de conexión a Neon
cd scripts
npm run test:neon

# 2. Test del frontend local
cd ../frontend
npm run dev
# Verificar que aparezca la notificación de actualización

# 3. Verificar que los servicios estén configurados
# Revisar que todos los archivos .env.example estén actualizados
```

#### Después del Push:
1. **GitHub Actions** debe ejecutarse sin errores
2. **Frontend** debe deployarse en Vercel
3. **Auth Service** debe deployarse en Vercel  
4. **Course Service** debe deployarse en Render
5. **Notificación de actualización** debe aparecer en la landing page

---

### 6. 📁 Archivos Modificados/Creados

#### ✅ Nuevos archivos:
- `frontend/src/components/UpdateNotification.jsx`
- `frontend/public/build-info.json` (ejemplo)
- `scripts/test-neon-connection.js`
- `PRE-DEPLOYMENT-CHECKLIST.md`

#### ✅ Archivos modificados:
- `.github/workflows/deploy.yml` - Generación automática de build-info
- `frontend/src/pages/Landing.jsx` - Integración de notificaciones
- `frontend/src/index.css` - Animaciones para notificaciones
- `scripts/package.json` - Comandos de test

#### ✅ Archivos de configuración listos:
- `services/course-service/render.yaml`
- `services/course-service/.env.example`
- `frontend/.env.example`
- `database/neon-migration-course-service.sql`
- `scripts/migrate-neon.js`

---

## 🚀 PASOS FINALES PARA DEPLOYMENT

### 1. Ejecutar Migraciones en Neon:
```bash
cd scripts
$env:DATABASE_URL="tu_url_de_neon_aqui"
npm install
npm run test:neon
npm run migrate:neon
```

### 2. Configurar Secrets en GitHub:
- Ve a tu repositorio → Settings → Secrets and variables → Actions
- Agrega todos los secrets listados arriba

### 3. Configurar Variables en Render:
- Crea el servicio course-service en Render
- Agrega todas las variables de entorno listadas

### 4. Configurar Variables en Vercel:
- Configura las variables de entorno del frontend
- Asegúrate de que las URLs apunten a los servicios correctos

### 5. Hacer Push Final:
```bash
git add .
git commit -m "feat: Complete production deployment setup with Neon DB and update notifications"
git push origin main
```

---

## ✨ Resultado Esperado

Después del deployment exitoso tendrás:

1. **Sistema completo funcionando en producción**
2. **Base de datos Neon con todas las tablas**
3. **Notificaciones automáticas de actualización**
4. **Deployment automático via GitHub Actions**
5. **Todos los servicios comunicándose correctamente**

---

## 🆘 Troubleshooting

Si algo falla:

1. **Revisa los logs de GitHub Actions**
2. **Verifica las variables de entorno**
3. **Usa el script de test de conexión a Neon**
4. **Consulta el archivo DEPLOYMENT.md para más detalles**

¡Todo está listo para producción! 🎉