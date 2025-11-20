# =====================================================
# SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS
# EduPlus Academy - PostgreSQL Setup
# =====================================================

param(
    [switch]$WithTestData,
    [switch]$SchemaOnly,
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$Database = "eduplus_academy",
    [string]$Username = "eduplus_user",
    [string]$Password = "eduplus_password"
)

Write-Host "🚀 Configurando base de datos EduPlus Academy..." -ForegroundColor Green
Write-Host "📊 Host: $Host" -ForegroundColor Cyan
Write-Host "🔌 Puerto: $Port" -ForegroundColor Cyan
Write-Host "💾 Base de datos: $Database" -ForegroundColor Cyan
Write-Host "👤 Usuario: $Username" -ForegroundColor Cyan

# Verificar si Docker está ejecutándose
Write-Host "`n🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está ejecutándose"
    }
    Write-Host "✅ Docker está ejecutándose" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está disponible" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que Docker Desktop esté ejecutándose" -ForegroundColor Yellow
    exit 1
}

# Verificar si el contenedor PostgreSQL está ejecutándose
Write-Host "`n🔍 Verificando contenedor PostgreSQL..." -ForegroundColor Yellow
$postgresContainer = docker ps --filter "name=postgres" --format "table {{.Names}}" | Select-String "postgres"
if (-not $postgresContainer) {
    Write-Host "⚠️ Contenedor PostgreSQL no encontrado" -ForegroundColor Yellow
    Write-Host "🔄 Iniciando contenedores con docker-compose..." -ForegroundColor Yellow
    
    # Cambiar al directorio raíz del proyecto
    $projectRoot = Split-Path -Parent $PSScriptRoot
    Set-Location $projectRoot
    
    try {
        docker-compose up -d postgres
        Start-Sleep -Seconds 10
        Write-Host "✅ Contenedor PostgreSQL iniciado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al iniciar contenedor PostgreSQL" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Contenedor PostgreSQL está ejecutándose" -ForegroundColor Green
}

# Esperar a que PostgreSQL esté listo
Write-Host "`n⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    try {
        $testConnection = docker exec postgres pg_isready -h localhost -p 5432 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL está listo" -ForegroundColor Green
            break
        }
    } catch {
        # Continuar intentando
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "❌ Timeout: PostgreSQL no está respondiendo" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "⏳ Intento $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
} while ($true)

# Ejecutar script de esquema
Write-Host "`n📋 Ejecutando script de esquema..." -ForegroundColor Yellow
$schemaScript = Join-Path $PSScriptRoot "setup-postgres.sql"
try {
    docker exec -i postgres psql -U $Username -d $Database -f /dev/stdin < $schemaScript
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Esquema creado exitosamente" -ForegroundColor Green
    } else {
        throw "Error al ejecutar script de esquema"
    }
} catch {
    Write-Host "❌ Error al crear esquema: $_" -ForegroundColor Red
    exit 1
}

# Ejecutar datos de prueba si se solicita
if ($WithTestData -and -not $SchemaOnly) {
    Write-Host "`n📊 Insertando datos de prueba..." -ForegroundColor Yellow
    $testDataScript = Join-Path $PSScriptRoot "auth-service-test-data.sql"
    try {
        docker exec -i postgres psql -U $Username -d $Database -f /dev/stdin < $testDataScript
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Datos de prueba insertados exitosamente" -ForegroundColor Green
        } else {
            throw "Error al insertar datos de prueba"
        }
    } catch {
        Write-Host "❌ Error al insertar datos de prueba: $_" -ForegroundColor Red
        exit 1
    }
}

# Verificar la instalación
Write-Host "`n🔍 Verificando instalación..." -ForegroundColor Yellow
try {
    $userCount = docker exec postgres psql -U $Username -d $Database -t -c "SELECT COUNT(*) FROM users;"
    $tableCount = docker exec postgres psql -U $Username -d $Database -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
    
    Write-Host "✅ Verificación completada:" -ForegroundColor Green
    Write-Host "   📊 Tablas creadas: $($tableCount.Trim())" -ForegroundColor Cyan
    Write-Host "   👥 Usuarios en base de datos: $($userCount.Trim())" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Error en verificación: $_" -ForegroundColor Yellow
}

# Mostrar información de conexión
Write-Host "`n🔗 Información de conexión:" -ForegroundColor Green
Write-Host "   Host: $Host" -ForegroundColor Cyan
Write-Host "   Puerto: $Port" -ForegroundColor Cyan
Write-Host "   Base de datos: $Database" -ForegroundColor Cyan
Write-Host "   Usuario: $Username" -ForegroundColor Cyan
Write-Host "   Contraseña: $Password" -ForegroundColor Cyan

# Mostrar credenciales de prueba si se insertaron datos
if ($WithTestData -and -not $SchemaOnly) {
    Write-Host "`n🔑 Credenciales de prueba disponibles:" -ForegroundColor Green
    Write-Host "   Estudiante: juan.perez@example.com / password123" -ForegroundColor Cyan
    Write-Host "   Instructor: carlos.rodriguez@example.com / password123" -ForegroundColor Cyan
    Write-Host "   Admin: roberto.jimenez@example.com / password123" -ForegroundColor Cyan
}

Write-Host "`n✅ Configuración de base de datos completada exitosamente!" -ForegroundColor Green
Write-Host "🚀 Ahora puedes iniciar el auth-service con: npm start" -ForegroundColor Yellow

# Ejemplos de uso
Write-Host "`n📖 Ejemplos de uso de este script:" -ForegroundColor Magenta
Write-Host "   .\setup-database.ps1                    # Solo esquema" -ForegroundColor Gray
Write-Host "   .\setup-database.ps1 -WithTestData      # Esquema + datos de prueba" -ForegroundColor Gray
Write-Host "   .\setup-database.ps1 -SchemaOnly        # Solo esquema (explícito)" -ForegroundColor Gray