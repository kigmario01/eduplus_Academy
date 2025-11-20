# =====================================================
# SETUP COMPLETO DE BASE DE DATOS EDUPLUS ACADEMY
# Incluye: Auth Service + Course Management + Messaging
# =====================================================

param(
    [string]$Host = "localhost",
    [int]$Port = 5432,
    [string]$Database = "eduplus_academy",
    [string]$Username = "postgres",
    [string]$Password = "postgres123",
    [switch]$SkipTestData,
    [switch]$ResetDatabase,
    [switch]$Help
)

# Mostrar ayuda
if ($Help) {
    Write-Host "=== SETUP COMPLETO DE BASE DE DATOS EDUPLUS ACADEMY ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "DESCRIPCIÓN:" -ForegroundColor Yellow
    Write-Host "  Este script configura la base de datos completa de EduPlus Academy incluyendo:"
    Write-Host "  - Sistema de autenticación y usuarios"
    Write-Host "  - Gestión completa de cursos"
    Write-Host "  - Sistema de mensajería"
    Write-Host "  - Notificaciones y foros"
    Write-Host ""
    Write-Host "PARÁMETROS:" -ForegroundColor Yellow
    Write-Host "  -Host         Servidor PostgreSQL (default: localhost)"
    Write-Host "  -Port         Puerto PostgreSQL (default: 5432)"
    Write-Host "  -Database     Nombre de la base de datos (default: eduplus_academy)"
    Write-Host "  -Username     Usuario PostgreSQL (default: postgres)"
    Write-Host "  -Password     Contraseña PostgreSQL (default: postgres123)"
    Write-Host "  -SkipTestData No insertar datos de prueba"
    Write-Host "  -ResetDatabase Eliminar y recrear la base de datos"
    Write-Host "  -Help         Mostrar esta ayuda"
    Write-Host ""
    Write-Host "EJEMPLOS:" -ForegroundColor Yellow
    Write-Host "  .\setup-complete-database.ps1"
    Write-Host "  .\setup-complete-database.ps1 -ResetDatabase"
    Write-Host "  .\setup-complete-database.ps1 -SkipTestData"
    Write-Host "  .\setup-complete-database.ps1 -Host 'db.example.com' -Password 'mi_password'"
    Write-Host ""
    exit 0
}

# Función para escribir mensajes con colores
function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    
    switch ($Type) {
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Error"   { Write-Host "❌ $Message" -ForegroundColor Red }
        "Warning" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "Info"    { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
        "Step"    { Write-Host "🔄 $Message" -ForegroundColor Magenta }
    }
}

# Función para ejecutar comandos SQL
function Invoke-SqlCommand {
    param(
        [string]$Query,
        [string]$Description,
        [string]$DatabaseName = $Database
    )
    
    try {
        Write-Status "Ejecutando: $Description" "Step"
        
        $env:PGPASSWORD = $Password
        $result = psql -h $Host -p $Port -U $Username -d $DatabaseName -c $Query 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "$Description - Completado" "Success"
            return $true
        } else {
            Write-Status "$Description - Error: $result" "Error"
            return $false
        }
    }
    catch {
        Write-Status "$Description - Excepción: $($_.Exception.Message)" "Error"
        return $false
    }
}

# Función para ejecutar archivos SQL
function Invoke-SqlFile {
    param(
        [string]$FilePath,
        [string]$Description,
        [string]$DatabaseName = $Database
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Status "Archivo no encontrado: $FilePath" "Error"
        return $false
    }
    
    try {
        Write-Status "Ejecutando archivo: $Description" "Step"
        
        $env:PGPASSWORD = $Password
        $result = psql -h $Host -p $Port -U $Username -d $DatabaseName -f $FilePath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Status "$Description - Completado" "Success"
            return $true
        } else {
            Write-Status "$Description - Error: $result" "Error"
            return $false
        }
    }
    catch {
        Write-Status "$Description - Excepción: $($_.Exception.Message)" "Error"
        return $false
    }
}

# Verificar si PostgreSQL está disponible
function Test-PostgreSQLConnection {
    try {
        $env:PGPASSWORD = $Password
        $result = psql -h $Host -p $Port -U $Username -d postgres -c "SELECT version();" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            return $true
        } else {
            return $false
        }
    }
    catch {
        return $false
    }
}

# Verificar si Docker está ejecutándose
function Test-DockerRunning {
    try {
        $result = docker ps 2>&1
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Iniciar contenedor PostgreSQL si es necesario
function Start-PostgreSQLContainer {
    Write-Status "Verificando contenedor PostgreSQL..." "Step"
    
    $containerExists = docker ps -a --filter "name=eduplus-postgres" --format "{{.Names}}" | Select-String "eduplus-postgres"
    
    if (-not $containerExists) {
        Write-Status "Creando contenedor PostgreSQL..." "Step"
        docker run --name eduplus-postgres -e POSTGRES_PASSWORD=$Password -e POSTGRES_DB=$Database -p 5432:5432 -d postgres:15
        Start-Sleep -Seconds 10
    } else {
        $containerRunning = docker ps --filter "name=eduplus-postgres" --format "{{.Names}}" | Select-String "eduplus-postgres"
        
        if (-not $containerRunning) {
            Write-Status "Iniciando contenedor PostgreSQL..." "Step"
            docker start eduplus-postgres
            Start-Sleep -Seconds 5
        }
    }
}

# Función principal
function Main {
    Write-Host ""
    Write-Host "=== SETUP COMPLETO DE BASE DE DATOS EDUPLUS ACADEMY ===" -ForegroundColor Cyan
    Write-Host "Configurando sistema completo con cursos y mensajería" -ForegroundColor White
    Write-Host ""
    
    # Verificar Docker si estamos usando localhost
    if ($Host -eq "localhost") {
        if (-not (Test-DockerRunning)) {
            Write-Status "Docker no está ejecutándose. Iniciando Docker..." "Warning"
            Start-Process "Docker Desktop" -Wait
            Start-Sleep -Seconds 10
        }
        
        Start-PostgreSQLContainer
        Write-Status "Esperando que PostgreSQL esté listo..." "Step"
        Start-Sleep -Seconds 15
    }
    
    # Verificar conexión a PostgreSQL
    Write-Status "Verificando conexión a PostgreSQL..." "Step"
    if (-not (Test-PostgreSQLConnection)) {
        Write-Status "No se puede conectar a PostgreSQL en $Host`:$Port" "Error"
        Write-Status "Verifique que PostgreSQL esté ejecutándose y las credenciales sean correctas" "Error"
        exit 1
    }
    Write-Status "Conexión a PostgreSQL exitosa" "Success"
    
    # Resetear base de datos si se solicita
    if ($ResetDatabase) {
        Write-Status "Eliminando base de datos existente..." "Warning"
        Invoke-SqlCommand "DROP DATABASE IF EXISTS $Database;" "Eliminar base de datos" "postgres"
    }
    
    # Crear base de datos
    Write-Status "Creando base de datos $Database..." "Step"
    Invoke-SqlCommand "CREATE DATABASE $Database;" "Crear base de datos" "postgres"
    
    # Ejecutar esquemas SQL
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    Write-Status "Configurando esquema de autenticación..." "Step"
    if (-not (Invoke-SqlFile "$scriptPath\setup-postgres.sql" "Esquema de autenticación")) {
        Write-Status "Error configurando esquema de autenticación" "Error"
        exit 1
    }
    
    Write-Status "Configurando esquema de gestión de cursos..." "Step"
    if (-not (Invoke-SqlFile "$scriptPath\course-management-schema.sql" "Esquema de gestión de cursos")) {
        Write-Status "Error configurando esquema de gestión de cursos" "Error"
        exit 1
    }
    
    # Insertar datos de prueba si no se omite
    if (-not $SkipTestData) {
        Write-Status "Insertando datos de prueba de autenticación..." "Step"
        if (-not (Invoke-SqlFile "$scriptPath\realistic-test-data.sql" "Datos de prueba de autenticación")) {
            Write-Status "Advertencia: Error insertando datos de prueba de autenticación" "Warning"
        }
        
        Write-Status "Insertando datos de prueba de cursos..." "Step"
        if (-not (Invoke-SqlFile "$scriptPath\course-management-test-data.sql" "Datos de prueba de cursos")) {
            Write-Status "Advertencia: Error insertando datos de prueba de cursos" "Warning"
        }
    }
    
    # Verificación final
    Write-Status "Verificando instalación..." "Step"
    
    $tableCount = Invoke-SqlCommand "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" "Contar tablas"
    
    if ($tableCount) {
        Write-Status "Base de datos configurada exitosamente" "Success"
        
        # Mostrar estadísticas
        Write-Host ""
        Write-Host "=== ESTADÍSTICAS DE LA BASE DE DATOS ===" -ForegroundColor Cyan
        
        $env:PGPASSWORD = $Password
        
        # Contar usuarios
        $userCount = psql -h $Host -p $Port -U $Username -d $Database -t -c "SELECT COUNT(*) FROM users;" 2>$null
        if ($userCount) {
            Write-Host "👥 Usuarios: $($userCount.Trim())" -ForegroundColor White
        }
        
        # Contar cursos
        $courseCount = psql -h $Host -p $Port -U $Username -d $Database -t -c "SELECT COUNT(*) FROM courses;" 2>$null
        if ($courseCount) {
            Write-Host "📚 Cursos: $($courseCount.Trim())" -ForegroundColor White
        }
        
        # Contar inscripciones
        $enrollmentCount = psql -h $Host -p $Port -U $Username -d $Database -t -c "SELECT COUNT(*) FROM course_enrollments;" 2>$null
        if ($enrollmentCount) {
            Write-Host "📝 Inscripciones: $($enrollmentCount.Trim())" -ForegroundColor White
        }
        
        # Contar conversaciones
        $conversationCount = psql -h $Host -p $Port -U $Username -d $Database -t -c "SELECT COUNT(*) FROM conversations;" 2>$null
        if ($conversationCount) {
            Write-Host "💬 Conversaciones: $($conversationCount.Trim())" -ForegroundColor White
        }
        
        # Contar mensajes
        $messageCount = psql -h $Host -p $Port -U $Username -d $Database -t -c "SELECT COUNT(*) FROM messages;" 2>$null
        if ($messageCount) {
            Write-Host "📨 Mensajes: $($messageCount.Trim())" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "=== INFORMACIÓN DE CONEXIÓN ===" -ForegroundColor Cyan
        Write-Host "Host: $Host" -ForegroundColor White
        Write-Host "Puerto: $Port" -ForegroundColor White
        Write-Host "Base de datos: $Database" -ForegroundColor White
        Write-Host "Usuario: $Username" -ForegroundColor White
        Write-Host ""
        
        Write-Host "=== CREDENCIALES DE PRUEBA ===" -ForegroundColor Cyan
        Write-Host "Instructores:" -ForegroundColor Yellow
        Write-Host "  ana.garcia@eduplus.com / password123" -ForegroundColor White
        Write-Host "  carlos.rodriguez@eduplus.com / password123" -ForegroundColor White
        Write-Host "  maria.lopez@eduplus.com / password123" -ForegroundColor White
        Write-Host ""
        Write-Host "Estudiantes:" -ForegroundColor Yellow
        Write-Host "  juan.perez@email.com / password123" -ForegroundColor White
        Write-Host "  elena.ruiz@email.com / password123" -ForegroundColor White
        Write-Host "  miguel.torres@email.com / password123" -ForegroundColor White
        Write-Host ""
        
        Write-Host "=== PRÓXIMOS PASOS ===" -ForegroundColor Cyan
        Write-Host "1. Iniciar auth-service: cd services\auth-service && npm start" -ForegroundColor White
        Write-Host "2. Iniciar course-service: cd services\course-service && npm start" -ForegroundColor White
        Write-Host "3. Iniciar frontend: cd frontend && npm start" -ForegroundColor White
        Write-Host "4. Probar endpoints: .\test-auth-endpoints.ps1" -ForegroundColor White
        Write-Host "5. Verificar base de datos: .\verify-database.ps1" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Status "Error en la verificación de la base de datos" "Error"
        exit 1
    }
}

# Ejecutar función principal
Main