# Script para verificar la integridad de la base de datos PostgreSQL
# Verifica que todas las tablas, índices y datos estén correctamente configurados

param(
    [string]$Host = "localhost",
    [int]$Port = 5432,
    [string]$Database = "eduplus_academy",
    [string]$Username = "eduplus_user",
    [string]$Password = "eduplus_password"
)

Write-Host "🔍 Verificando integridad de la base de datos PostgreSQL..." -ForegroundColor Cyan
Write-Host "Host: $Host:$Port" -ForegroundColor Gray
Write-Host "Database: $Database" -ForegroundColor Gray
Write-Host ""

# Función para ejecutar consultas SQL
function Invoke-PostgreSQLQuery {
    param(
        [string]$Query,
        [string]$Description
    )
    
    try {
        Write-Host "📊 $Description..." -ForegroundColor Yellow
        
        $result = docker exec postgres psql -U $Username -d $Database -t -c $Query 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description: OK" -ForegroundColor Green
            if ($result -and $result.Trim()) {
                Write-Host "   Resultado: $($result.Trim())" -ForegroundColor Gray
            }
            return $true
        } else {
            Write-Host "❌ $Description: ERROR" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ $Description: EXCEPCIÓN" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    Write-Host ""
}

# Verificar conexión a PostgreSQL
Write-Host "🔌 1. Verificando conexión a PostgreSQL..." -ForegroundColor Yellow
$connectionTest = docker exec postgres pg_isready -h localhost -p 5432 -U $Username -d $Database 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexión a PostgreSQL: OK" -ForegroundColor Green
} else {
    Write-Host "❌ Conexión a PostgreSQL: ERROR" -ForegroundColor Red
    Write-Host "   Error: $connectionTest" -ForegroundColor Red
    Write-Host "🛑 No se puede continuar sin conexión a la base de datos." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verificar que la base de datos existe
Invoke-PostgreSQLQuery -Query "SELECT current_database();" -Description "Verificando base de datos actual"

# Verificar extensiones
Invoke-PostgreSQLQuery -Query "SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');" -Description "Verificando extensiones instaladas"

# Verificar tablas principales
$tables = @(
    "users",
    "course_enrollments", 
    "lesson_progress",
    "user_activities",
    "user_achievements",
    "user_preferences",
    "quiz_attempts",
    "user_certificates"
)

Write-Host "📋 2. Verificando estructura de tablas..." -ForegroundColor Yellow
foreach ($table in $tables) {
    Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table';" -Description "Verificando tabla $table"
}

# Verificar índices importantes
Write-Host "🔍 3. Verificando índices..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('users', 'course_enrollments', 'user_activities');" -Description "Contando índices en tablas principales"

# Verificar triggers
Write-Host "⚡ 4. Verificando triggers..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%updated_at%';" -Description "Verificando triggers de updated_at"

# Verificar vista user_stats
Write-Host "👁️ 5. Verificando vistas..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'user_stats';" -Description "Verificando vista user_stats"

# Verificar datos de prueba
Write-Host "📊 6. Verificando datos de prueba..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM users;" -Description "Contando usuarios"
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM course_enrollments;" -Description "Contando inscripciones"
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM user_activities;" -Description "Contando actividades"

# Verificar integridad referencial
Write-Host "🔗 7. Verificando integridad referencial..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM course_enrollments ce LEFT JOIN users u ON ce.user_id = u.id WHERE u.id IS NULL;" -Description "Verificando referencias huérfanas en course_enrollments"
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM user_activities ua LEFT JOIN users u ON ua.user_id = u.id WHERE u.id IS NULL;" -Description "Verificando referencias huérfanas en user_activities"

# Verificar roles de usuario
Write-Host "👥 8. Verificando roles de usuario..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT role, COUNT(*) FROM users GROUP BY role;" -Description "Distribución de roles"

# Verificar estadísticas de la vista user_stats
Write-Host "📈 9. Verificando vista de estadísticas..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM user_stats;" -Description "Contando registros en user_stats"

# Verificar configuración de secuencias
Write-Host "🔢 10. Verificando secuencias..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT schemaname, sequencename, last_value FROM pg_sequences WHERE sequencename LIKE '%_id_seq';" -Description "Estado de secuencias"

# Verificar permisos del usuario
Write-Host "🔐 11. Verificando permisos..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT has_database_privilege('$Username', '$Database', 'CONNECT');" -Description "Verificando permisos de conexión"

# Verificar tamaño de la base de datos
Write-Host "💾 12. Verificando tamaño de base de datos..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT pg_size_pretty(pg_database_size('$Database'));" -Description "Tamaño de la base de datos"

# Verificar conexiones activas
Write-Host "🔌 13. Verificando conexiones activas..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = '$Database';" -Description "Conexiones activas"

# Verificar logs de errores recientes
Write-Host "📝 14. Verificando configuración..." -ForegroundColor Yellow
Invoke-PostgreSQLQuery -Query "SHOW timezone;" -Description "Zona horaria configurada"
Invoke-PostgreSQLQuery -Query "SHOW max_connections;" -Description "Máximo de conexiones"

# Resumen final
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📋 RESUMEN DE VERIFICACIÓN DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Verificación final de integridad
Write-Host "🔍 Ejecutando verificación final de integridad..." -ForegroundColor Yellow
$finalCheck = docker exec postgres psql -U $Username -d $Database -c "
SELECT 
    'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 
    'course_enrollments' as tabla, COUNT(*) as registros FROM course_enrollments
UNION ALL
SELECT 
    'user_activities' as tabla, COUNT(*) as registros FROM user_activities
UNION ALL
SELECT 
    'user_achievements' as tabla, COUNT(*) as registros FROM user_achievements;
" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Verificación final: EXITOSA" -ForegroundColor Green
    Write-Host "Resumen de registros:" -ForegroundColor Gray
    Write-Host $finalCheck -ForegroundColor Gray
} else {
    Write-Host "❌ Verificación final: ERROR" -ForegroundColor Red
    Write-Host $finalCheck -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Verificación de base de datos completada!" -ForegroundColor Cyan
Write-Host ""

# Comandos útiles adicionales
Write-Host "📖 COMANDOS ÚTILES ADICIONALES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 Para conectar manualmente a la base de datos:" -ForegroundColor White
Write-Host "   docker exec -it postgres psql -U $Username -d $Database" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Para ver estadísticas detalladas:" -ForegroundColor White
Write-Host "   SELECT * FROM user_stats;" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 Para reinicializar la base de datos:" -ForegroundColor White
Write-Host "   .\database\setup-database.ps1 -WithTestData" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Para ver logs de PostgreSQL:" -ForegroundColor White
Write-Host "   docker logs postgres" -ForegroundColor Gray