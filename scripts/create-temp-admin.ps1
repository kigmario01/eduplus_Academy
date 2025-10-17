# Script para crear un usuario administrador temporal
Write-Host "Creando usuario administrador temporal..." -ForegroundColor Green

$baseUrl = "http://localhost:4000"
$tempAdminEmail = "temp.admin@eduplus.com"
$tempAdminPassword = "TempAdmin123!"

try {
    # Intentar registrar un nuevo usuario
    $registerData = @{
        email = $tempAdminEmail
        password = $tempAdminPassword
        name = "Temp"
        lastname = "Admin"
        role = "admin"
    } | ConvertTo-Json

    Write-Host "Intentando registrar usuario administrador temporal..." -ForegroundColor Yellow
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    
    Write-Host "Usuario registrado exitosamente!" -ForegroundColor Green
    Write-Host "Email: $tempAdminEmail" -ForegroundColor Cyan
    Write-Host "Password: $tempAdminPassword" -ForegroundColor Cyan
    
    # Intentar hacer login
    Write-Host "`nProbando login..." -ForegroundColor Yellow
    $loginData = @{
        email = $tempAdminEmail
        password = $tempAdminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "Login exitoso!" -ForegroundColor Green
        Write-Host "Usuario: $($loginResponse.user.name) $($loginResponse.user.lastname)" -ForegroundColor Cyan
        Write-Host "Rol: $($loginResponse.user.role)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`nCredenciales temporales:" -ForegroundColor Green
Write-Host "Email: $tempAdminEmail" -ForegroundColor Cyan
Write-Host "Password: $tempAdminPassword" -ForegroundColor Cyan