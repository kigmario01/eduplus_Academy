# 🗄️ Scripts de Base de Datos - EduPlus Academy

Este directorio contiene todos los scripts necesarios para configurar la base de datos PostgreSQL de producción para EduPlus Academy.

## 📁 Archivos Incluidos

### Scripts SQL
- **`init-database.sql`** - Script completo de inicialización (esquema + datos de prueba)
- **`setup-postgres.sql`** - Solo esquema de base de datos (para producción)
- **`auth-service-schema.sql`** - Esquema específico del auth-service
- **`auth-service-test-data.sql`** - Datos de prueba realistas para desarrollo

### Scripts de Automatización
- **`setup-database.ps1`** - Script de PowerShell para automatizar la configuración

## 🚀 Configuración Rápida

### Opción 1: Usando el Script de PowerShell (Recomendado)

```powershell
# Solo esquema (para producción)
.\database\setup-database.ps1

# Esquema + datos de prueba (para desarrollo)
.\database\setup-database.ps1 -WithTestData
```

### Opción 2: Configuración Manual

1. **Iniciar PostgreSQL con Docker:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Ejecutar script de esquema:**
   ```bash
   docker exec -i postgres psql -U eduplus_user -d eduplus_academy < database/setup-postgres.sql
   ```

3. **Insertar datos de prueba (opcional):**
   ```bash
   docker exec -i postgres psql -U eduplus_user -d eduplus_academy < database/auth-service-test-data.sql
   ```

## 🔧 Configuración de Conexión

### Variables de Entorno (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eduplus_academy
DB_USER=eduplus_user
DB_PASSWORD=eduplus_password
```

### Configuración Docker Compose
```yaml
postgres:
  image: postgres:15
  environment:
    POSTGRES_DB: eduplus_academy
    POSTGRES_USER: eduplus_user
    POSTGRES_PASSWORD: eduplus_password
  ports:
    - "5432:5432"
```

## 📊 Esquema de Base de Datos

### Tablas Principales

#### `users`
- Información básica de usuarios
- Roles: student, instructor, admin
- Campos: id, uuid, name, lastname, email, password, role, etc.

#### `course_enrollments`
- Inscripciones de usuarios a cursos
- Progreso y estado de completación
- Certificados emitidos

#### `lesson_progress`
- Progreso detallado por lección
- Tiempo dedicado y posición actual
- Notas del estudiante

#### `user_activities`
- Registro de todas las actividades del usuario
- Sistema de puntos
- Metadatos en formato JSON

#### `user_achievements`
- Logros y badges obtenidos
- Sistema de gamificación
- Diferentes tipos de logros

#### `user_preferences`
- Configuraciones personales del usuario
- Idioma, tema, notificaciones
- Velocidad de reproducción

#### `quiz_attempts`
- Intentos de quizzes y exámenes
- Puntuaciones y respuestas
- Historial de intentos

#### `user_certificates`
- Certificados emitidos
- Códigos de verificación
- URLs de descarga

### Índices y Optimizaciones
- Índices en campos frecuentemente consultados
- Triggers para actualización automática de timestamps
- Vista `user_stats` para estadísticas agregadas

## 🔑 Credenciales de Prueba

### Estudiantes
- `juan.perez@example.com` / `password123`
- `maria.gonzalez@example.com` / `password123`
- `ana.hernandez@example.com` / `password123`

### Instructores
- `carlos.rodriguez@example.com` / `password123`
- `laura.morales@example.com` / `password123`

### Administrador
- `roberto.jimenez@example.com` / `password123`

## 🛠️ Comandos Útiles

### Verificar Estado de la Base de Datos
```bash
# Conectar a PostgreSQL
docker exec -it postgres psql -U eduplus_user -d eduplus_academy

# Listar tablas
\dt

# Ver estadísticas
SELECT * FROM user_stats;

# Contar registros
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM course_enrollments) as enrollments,
  (SELECT COUNT(*) FROM user_activities) as activities;
```

### Backup y Restore
```bash
# Crear backup
docker exec postgres pg_dump -U eduplus_user eduplus_academy > backup.sql

# Restaurar backup
docker exec -i postgres psql -U eduplus_user -d eduplus_academy < backup.sql
```

### Limpiar Base de Datos
```sql
-- Eliminar todos los datos (mantener estructura)
TRUNCATE users, course_enrollments, lesson_progress, user_activities, 
         user_achievements, user_preferences, quiz_attempts, 
         user_certificates RESTART IDENTITY CASCADE;
```

## 🔍 Verificación de Endpoints

Después de configurar la base de datos, verifica que el auth-service funcione:

```bash
# Iniciar el servicio
cd services/auth-service
npm start

# Verificar health check
curl http://localhost:3001/health

# Verificar estado de base de datos
curl http://localhost:3001/api/database/status
```

## 📈 Monitoreo

### Logs de PostgreSQL
```bash
docker logs postgres
```

### Estadísticas de Conexiones
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'eduplus_academy';
```

### Tamaño de Base de Datos
```sql
SELECT pg_size_pretty(pg_database_size('eduplus_academy'));
```

## 🚨 Troubleshooting

### Error de Conexión
1. Verificar que Docker esté ejecutándose
2. Verificar que el contenedor PostgreSQL esté activo
3. Verificar variables de entorno
4. Verificar puertos disponibles

### Error de Permisos
```sql
GRANT ALL PRIVILEGES ON DATABASE eduplus_academy TO eduplus_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eduplus_user;
```

### Reiniciar Completamente
```bash
# Detener contenedores
docker-compose down

# Eliminar volúmenes (CUIDADO: elimina todos los datos)
docker-compose down -v

# Reiniciar
docker-compose up -d postgres
.\database\setup-database.ps1 -WithTestData
```

## 📝 Notas de Producción

1. **Seguridad**: Cambiar credenciales por defecto en producción
2. **Backup**: Configurar backups automáticos regulares
3. **Monitoreo**: Implementar alertas de rendimiento
4. **SSL**: Habilitar conexiones SSL en producción
5. **Escalabilidad**: Considerar read replicas para alta carga

## 🤝 Contribución

Para modificar el esquema:
1. Actualizar `setup-postgres.sql`
2. Crear script de migración si es necesario
3. Actualizar datos de prueba si aplica
4. Documentar cambios en este README