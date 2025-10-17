# Script para verificar endpoints del auth-service con PostgreSQL
# Asegúrate de que el auth-service esté ejecutándose antes de ejecutar este script

param(
    [string]$BaseUrl = "http://localhost:4000",
    [string]$TestEmail = "juan.perez@example.com",
    [string]$TestPassword = "password123"
)

Write-Host "🔍 Verificando endpoints del auth-service..." -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

# Función para hacer peticiones HTTP
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $statusCode
        }
    }
}

# Función para mostrar resultados
function Show-TestResult {
    param(
        [string]$TestName,
        [object]$Result,
        [string]$ExpectedStatus = "Success"
    )
    
    if ($Result.Success -and $ExpectedStatus -eq "Success") {
        Write-Host "✅ $TestName" -ForegroundColor Green
        if ($Result.Data) {
            Write-Host "   Respuesta: $($Result.Data | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
    }
    elseif (!$Result.Success -and $ExpectedStatus -eq "Error") {
        Write-Host "✅ $TestName (Error esperado)" -ForegroundColor Green
        Write-Host "   Error: $($Result.Error)" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ $TestName" -ForegroundColor Red
        Write-Host "   Error: $($Result.Error)" -ForegroundColor Red
        Write-Host "   Status Code: $($Result.StatusCode)" -ForegroundColor Red
    }
    Write-Host ""
}

# Variables globales para el token
$global:AuthToken = $null

Write-Host "🏥 1. Verificando Health Check..." -ForegroundColor Yellow
$healthResult = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/health"
Show-TestResult -TestName "Health Check" -Result $healthResult

Write-Host "📊 2. Verificando Database Status..." -ForegroundColor Yellow
$dbStatusResult = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/api/database/status"
Show-TestResult -TestName "Database Status" -Result $dbStatusResult

Write-Host "🔐 3. Probando Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $TestEmail
    password = $TestPassword
}
$loginResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/api/auth/login" -Body $loginBody
Show-TestResult -TestName "Login con credenciales válidas" -Result $loginResult

if ($loginResult.Success -and $loginResult.Data.token) {
    $global:AuthToken = $loginResult.Data.token
    Write-Host "🎫 Token obtenido: $($global:AuthToken.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
}

Write-Host "🔐 4. Probando Login con credenciales inválidas..." -ForegroundColor Yellow
$invalidLoginBody = @{
    email = "invalid@example.com"
    password = "wrongpassword"
}
$invalidLoginResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/api/auth/login" -Body $invalidLoginBody
Show-TestResult -TestName "Login con credenciales inválidas" -Result $invalidLoginResult -ExpectedStatus "Error"

if ($global:AuthToken) {
    $authHeaders = @{
        "Authorization" = "Bearer $global:AuthToken"
    }
    
    Write-Host "👤 5. Probando User Summary..." -ForegroundColor Yellow
    $summaryResult = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/api/users/summary" -Headers $authHeaders
    Show-TestResult -TestName "User Summary" -Result $summaryResult
    
    Write-Host "📚 6. Probando User Courses..." -ForegroundColor Yellow
    $coursesResult = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/api/users/courses" -Headers $authHeaders
    Show-TestResult -TestName "User Courses" -Result $coursesResult
    
    Write-Host "📈 7. Probando User Activities..." -ForegroundColor Yellow
    $activitiesResult = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/api/users/activities" -Headers $activitiesResult
    Show-TestResult -TestName "User Activities" -Result $activitiesResult
    
    Write-Host "🔍 8. Probando User Profile..." -ForegroundColor Yellow
    $profileResult = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/api/users/profile" -Headers $authHeaders
    Show-TestResult -TestName "User Profile" -Result $profileResult
}
else {
    Write-Host "❌ No se pudo obtener token de autenticación. Saltando pruebas autenticadas." -ForegroundColor Red
}

Write-Host "🔐 9. Probando endpoints sin autenticación..." -ForegroundColor Yellow
$unauthorizedResult = Invoke-ApiRequest -Method "GET" -Url "$BaseUrl/api/users/summary"
Show-TestResult -TestName "Acceso sin autenticación" -Result $unauthorizedResult -ExpectedStatus "Error"

Write-Host "📝 10. Probando registro de usuario..." -ForegroundColor Yellow
$registerBody = @{
    name = "Usuario"
    lastname = "Prueba"
    email = "test.$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "password123"
    role = "student"
}
$registerResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/api/auth/register" -Body $registerBody
Show-TestResult -TestName "Registro de usuario" -Result $registerResult

Write-Host "📝 11. Probando registro con email duplicado..." -ForegroundColor Yellow
$duplicateRegisterBody = @{
    name = "Usuario"
    lastname = "Duplicado"
    email = $TestEmail
    password = "password123"
    role = "student"
}
$duplicateRegisterResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/api/auth/register" -Body $duplicateRegisterBody
Show-TestResult -TestName "Registro con email duplicado" -Result $duplicateRegisterResult -ExpectedStatus "Error"

# Resumen final
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📋 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

if ($healthResult.Success) {
    Write-Host "✅ Servicio de salud: OK" -ForegroundColor Green
} else {
    Write-Host "❌ Servicio de salud: FALLO" -ForegroundColor Red
}

if ($dbStatusResult.Success) {
    Write-Host "✅ Base de datos: CONECTADA" -ForegroundColor Green
} else {
    Write-Host "❌ Base de datos: DESCONECTADA" -ForegroundColor Red
}

if ($loginResult.Success) {
    Write-Host "✅ Autenticación: FUNCIONANDO" -ForegroundColor Green
} else {
    Write-Host "❌ Autenticación: FALLO" -ForegroundColor Red
}

if ($global:AuthToken) {
    Write-Host "✅ Endpoints autenticados: DISPONIBLES" -ForegroundColor Green
} else {
    Write-Host "❌ Endpoints autenticados: NO DISPONIBLES" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Verificación completada!" -ForegroundColor Cyan
Write-Host "Para más detalles, revisa los logs del auth-service." -ForegroundColor Gray

# Instrucciones adicionales
Write-Host ""
Write-Host "📖 INSTRUCCIONES ADICIONALES:" -ForegroundColor Yellow
Write-Host "1. Asegúrate de que PostgreSQL esté ejecutándose:" -ForegroundColor White
Write-Host "   docker-compose up -d postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Ejecuta las migraciones si es necesario:" -ForegroundColor White
Write-Host "   .\database\setup-database.ps1 -WithTestData" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Inicia el auth-service:" -ForegroundColor White
Write-Host "   cd services\auth-service" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verifica los logs en tiempo real:" -ForegroundColor White
Write-Host "   docker logs -f postgres" -ForegroundColor Gray
Write-Host "   # En otra terminal para el auth-service" -ForegroundColor Gray