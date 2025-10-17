# Script para crear un usuario administrador temporal
Write-Host "=== CREANDO USUARIO ADMINISTRADOR TEMPORAL ===" -ForegroundColor Green

$baseUrl = "http://localhost:4000"
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
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error en peticion a $Url : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Intentar registrar el usuario
Write-Host "1. Registrando usuario administrador temporal..." -ForegroundColor Yellow

$registerBody = @{
    firstName = "Temp"
    lastName = "Admin"
    email = $email
    password = $password
    role = "admin"
} | ConvertTo-Json

$registerResponse = Invoke-ApiRequest -Url "$baseUrl/api/auth/register" -Method "POST" -Body $registerBody

if ($registerResponse -and $registerResponse.success) {
    Write-Host "Usuario registrado exitosamente: $($registerResponse.user.email)" -ForegroundColor Green
} else {
    Write-Host "El usuario ya existe o hubo un error en el registro" -ForegroundColor Yellow
}

# 2. Intentar hacer login
Write-Host "2. Probando login con credenciales temporales..." -ForegroundColor Yellow

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Url "$baseUrl/api/auth/login" -Method "POST" -Body $loginBody

if ($loginResponse -and $loginResponse.success) {
    Write-Host "Login exitoso!" -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.email)" -ForegroundColor Green
    Write-Host "Rol: $($loginResponse.user.role)" -ForegroundColor Green
    Write-Host "Token generado correctamente" -ForegroundColor Green
} else {
    Write-Host "ERROR: Login fallido" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== USUARIO ADMINISTRADOR TEMPORAL LISTO ===" -ForegroundColor Green
Write-Host "Email: $email" -ForegroundColor Cyan
Write-Host "Password: $password" -ForegroundColor Cyan