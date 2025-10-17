# Configuración de Render con Neon Database

## 🚨 Error ECONNREFUSED 127.0.0.1:15432

Este error indica que el course-service está intentando conectarse a una base de datos local en lugar de Neon Database.

## ✅ Solución: Configurar Variables de Entorno en Render

### 1. Acceder al Dashboard de Render
1. Ve a [render.com](https://render.com)
2. Busca el servicio `eduplus-course-service`
3. Ve a la pestaña **Environment**

### 2. Configurar Variables de Entorno Requeridas

Agrega las siguientes variables de entorno:

```bash
# Base de datos Neon (REQUERIDO)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Autenticación (REQUERIDO)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Cloudinary (OPCIONAL - para subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# CORS (REQUERIDO)
CORS_ORIGIN=https://eduplus-academy.vercel.app

# Entorno (AUTOMÁTICO)
NODE_ENV=production
```

### 3. Obtener DATABASE_URL de Neon

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Selecciona tu proyecto EduPlus
3. Ve a **Connection Details**
4. Copia la **Connection String** completa
5. Pégala como valor de `DATABASE_URL` en Render

### 4. Ejecutar Migración de Base de Datos

Después de configurar las variables de entorno:

```bash
# En tu máquina local
cd scripts
npm run migrate:neon
```

### 5. Redeploy del Servicio

1. En Render, ve a tu servicio `eduplus-course-service`
2. Haz clic en **Manual Deploy** > **Deploy latest commit**
3. Monitorea los logs para verificar la conexión

## 🔍 Verificación de la Configuración

### Logs Esperados (Exitosos):
```
🔍 Database configuration:
NODE_ENV: production
DATABASE_URL present: true
DATABASE_URL preview: postgresql://neon_user...
🌐 Using Neon Database (Production)
✅ Database connection successful
```

### Logs de Error (Problemáticos):
```
🔍 Database configuration:
NODE_ENV: production
DATABASE_URL present: false
🏠 Using Local Database (Development)
Error: connect ECONNREFUSED 127.0.0.1:15432
```

## 🛠️ Troubleshooting

### Si el error persiste:

1. **Verificar DATABASE_URL**:
   - Debe empezar con `postgresql://`
   - Debe incluir `?sslmode=require` al final
   - No debe tener espacios o caracteres especiales sin escapar

2. **Verificar Neon Database**:
   - El proyecto debe estar activo en Neon
   - La base de datos debe estar creada
   - Las credenciales deben ser correctas

3. **Verificar Render**:
   - Las variables de entorno deben estar guardadas
   - El servicio debe estar redeployado después de los cambios
   - Los logs deben mostrar la conexión a Neon

## 📞 Comandos de Diagnóstico

```bash
# Probar conexión a Neon desde local
cd scripts
npm run test:neon

# Verificar configuración de Render
# (revisar logs del servicio en Render Dashboard)
```

## 🎯 Resultado Esperado

Después de la configuración correcta:
- ✅ Course-service se conecta a Neon Database
- ✅ API endpoints funcionan correctamente
- ✅ No más errores ECONNREFUSED
- ✅ Sistema completamente funcional en producción