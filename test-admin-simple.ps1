# Script simplificado para probar el login de administrador
Write-Host "=== PRUEBA SIMPLE DE LOGIN ADMIN ===" -ForegroundColor Green

$baseUrl = "http://localhost:4000"
$email = "temp.admin@eduplus.com"
$password = "TempAdmin123!"

# 1. Probar login
Write-Host "Probando login..." -ForegroundColor Yellow

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

Write-Host "Body: $loginBody" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    Write-Host "Respuesta completa:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
    if ($response.token) {
        Write-Host "Token obtenido exitosamente" -ForegroundColor Green
        $token = $response.token
        
        # 2. Probar endpoint de estadísticas
        Write-Host "`nProbando estadísticas..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $statsResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/stats" -Method GET -Headers $headers
        
        Write-Host "Estadísticas obtenidas:" -ForegroundColor Green
        $statsResponse | ConvertTo-Json -Depth 3
        
    } else {
        Write-Host "No se obtuvo token en la respuesta" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== FIN DE PRUEBA ===" -ForegroundColor Green