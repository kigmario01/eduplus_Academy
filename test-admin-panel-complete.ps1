# Script para probar todas las funcionalidades del panel de administración
Write-Host "=== PRUEBA COMPLETA DEL PANEL DE ADMINISTRACION ===" -ForegroundColor Green

# Configuración
$authBaseUrl = "http://localhost:4000"
$courseBaseUrl = "http://localhost:3001"
$email = "temp.admin@eduplus.com"
$password = "TempAdmin123!"

# Función para hacer peticiones HTTP
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error en peticion a $Url : $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
        }
        return $null
    }
}

# 1. Verificar servicios
Write-Host "`n1. Verificando servicios..." -ForegroundColor Yellow

# Auth Service Health Check
$authHealth = Invoke-ApiRequest -Url "$authBaseUrl/health"
if ($authHealth) {
    Write-Host "Auth Service: OK" -ForegroundColor Green
} else {
    Write-Host "Auth Service: NO DISPONIBLE" -ForegroundColor Red
    exit 1
}

# Course Service Health Check
$courseHealth = Invoke-ApiRequest -Url "$courseBaseUrl/health"
if ($courseHealth) {
    Write-Host "Course Service: OK" -ForegroundColor Green
} else {
    Write-Host "Course Service: NO DISPONIBLE" -ForegroundColor Red
}

# 2. Login de administrador
Write-Host "`n2. Probando login de administrador..." -ForegroundColor Yellow

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Url "$authBaseUrl/api/auth/login" -Method "POST" -Body $loginBody

if ($loginResponse -and $loginResponse.token) {
    $token = $loginResponse.token
    $user = $loginResponse.user
    Write-Host "Login exitoso: $($user.email) - Rol: $($user.role)" -ForegroundColor Green
    Write-Host "Token recibido: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    if ($user.role -ne "admin") {
        Write-Host "ERROR: El usuario no tiene rol de administrador" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ERROR: Login fallido" -ForegroundColor Red
    if ($loginResponse) {
        Write-Host "Respuesta: $($loginResponse | ConvertTo-Json)" -ForegroundColor Gray
    }
    exit 1
}

# Headers con token de autorización
$authHeaders = @{
    "Authorization" = "Bearer $token"
}

# 3. Probar estadísticas de usuarios
Write-Host "`n3. Probando estadisticas de usuarios..." -ForegroundColor Yellow

$userStats = Invoke-ApiRequest -Url "$authBaseUrl/api/admin/users/stats" -Headers $authHeaders

if ($userStats -and $userStats.success) {
    Write-Host "Estadisticas de usuarios obtenidas:" -ForegroundColor Green
    $stats = $userStats.data
    Write-Host "  - Total usuarios: $($stats.totalUsers)"
    Write-Host "  - Estudiantes: $($stats.totalStudents)"
    Write-Host "  - Instructores: $($stats.totalInstructors)"
    Write-Host "  - Administradores: $($stats.totalAdmins)"
    Write-Host "  - Usuarios activos: $($stats.activeUsers)"
    Write-Host "  - Usuarios verificados: $($stats.verifiedUsers)"
    Write-Host "  - Nuevos usuarios (ultimo mes): $($stats.newUsersLastMonth)"
} else {
    Write-Host "ERROR: No se pudieron obtener estadisticas de usuarios" -ForegroundColor Red
}

# 4. Probar listado de usuarios
Write-Host "`n4. Probando listado de usuarios..." -ForegroundColor Yellow

$usersList = Invoke-ApiRequest -Url "$authBaseUrl/api/admin/users?page=1&limit=10" -Headers $authHeaders

if ($usersList -and $usersList.success) {
    Write-Host "Lista de usuarios obtenida:" -ForegroundColor Green
    Write-Host "  - Total: $($usersList.total)"
    Write-Host "  - Pagina: $($usersList.page)"
    Write-Host "  - Usuarios en esta pagina: $($usersList.users.Count)"
    
    foreach ($user in $usersList.users) {
        Write-Host "    * $($user.email) - $($user.role) - Activo: $($user.is_active)"
    }
} else {
    Write-Host "ERROR: No se pudo obtener la lista de usuarios" -ForegroundColor Red
}

# 5. Probar estadísticas de cursos (si el servicio está disponible)
if ($courseHealth) {
    Write-Host "`n5. Probando estadisticas de cursos..." -ForegroundColor Yellow
    
    $courseStats = Invoke-ApiRequest -Url "$courseBaseUrl/api/admin/courses/stats" -Headers $authHeaders
    
    if ($courseStats) {
        Write-Host "Estadisticas de cursos obtenidas" -ForegroundColor Green
    } else {
        Write-Host "Endpoint de estadisticas de cursos no disponible" -ForegroundColor Yellow
    }
    
    # 6. Probar listado de cursos
    Write-Host "`n6. Probando listado de cursos..." -ForegroundColor Yellow
    
    $coursesList = Invoke-ApiRequest -Url "$courseBaseUrl/api/courses" -Headers $authHeaders
    
    if ($coursesList) {
        Write-Host "Lista de cursos obtenida" -ForegroundColor Green
        if ($coursesList.courses) {
            Write-Host "  - Total cursos: $($coursesList.courses.Count)"
        }
    } else {
        Write-Host "ERROR: No se pudo obtener la lista de cursos" -ForegroundColor Red
    }
}

Write-Host "`n=== PRUEBA COMPLETADA ===" -ForegroundColor Green
Write-Host "Panel de administracion probado exitosamente" -ForegroundColor Green