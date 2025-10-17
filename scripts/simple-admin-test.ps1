# Script simple para probar login de administrador
Write-Host "Probando login de administrador..." -ForegroundColor Green

$baseUrl = "http://localhost:4000"
$adminEmail = "temp.admin@eduplus.com"
$adminPassword = "TempAdmin123!"

try {
    $loginData = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($response.token) {
        Write-Host "Login exitoso!" -ForegroundColor Green
        Write-Host "Usuario: $($response.user.name) $($response.user.lastname)" -ForegroundColor Cyan
        Write-Host "Rol: $($response.user.role)" -ForegroundColor Cyan
        Write-Host "Token obtenido correctamente" -ForegroundColor Green
        
        # Probar endpoint de estadísticas
        $headers = @{
            "Authorization" = "Bearer $($response.token)"
            "Content-Type" = "application/json"
        }
        
        $userStats = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/stats" -Method GET -Headers $headers
        Write-Host "Estadisticas de usuarios obtenidas:" -ForegroundColor Green
        Write-Host "Total usuarios: $($userStats.totalUsers)" -ForegroundColor Cyan
        
    } else {
        Write-Host "Error: No se recibio token" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Prueba completada" -ForegroundColor Green