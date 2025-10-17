# Script para probar múltiples contraseñas para el usuario admin
Write-Host "Probando múltiples contraseñas para admin@eduplus.com..." -ForegroundColor Green

$baseUrl = "http://localhost:4000"
$adminEmail = "admin@eduplus.com"
$passwords = @("admin123", "password123", "admin", "123456", "eduplus123", "test123")

foreach ($password in $passwords) {
    Write-Host "`nProbando contraseña: $password" -ForegroundColor Yellow
    
    try {
        $loginData = @{
            email = $adminEmail
            password = $password
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        
        if ($response.token) {
            Write-Host "¡ÉXITO! Contraseña correcta: $password" -ForegroundColor Green
            Write-Host "Usuario: $($response.user.name) $($response.user.lastname)" -ForegroundColor Cyan
            Write-Host "Rol: $($response.user.role)" -ForegroundColor Cyan
            break
        }
        
    } catch {
        Write-Host "Falló con: $password" -ForegroundColor Red
    }
}

Write-Host "`nPrueba completada" -ForegroundColor Green