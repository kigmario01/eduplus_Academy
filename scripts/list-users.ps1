# Script para listar usuarios registrados en EduPlus Academy

Write-Host "Consultando usuarios registrados en EduPlus Academy..." -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Gray

try {
    # Consulta a traves de la API
    Write-Host ""
    Write-Host "OPCION 1: Consulta a traves de la API REST" -ForegroundColor Yellow
    Write-Host "----------------------------------------------------" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/users" -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Total de usuarios: $($data.count)" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar usuarios en formato tabla
    $data.users | Format-Table -Property @(
        @{Name="ID"; Expression={$_.id}; Width=5},
        @{Name="Nombre"; Expression={"$($_.name) $($_.lastname)"}; Width=25},
        @{Name="Email"; Expression={$_.email}; Width=30},
        @{Name="Rol"; Expression={$_.role}; Width=12},
        @{Name="Activo"; Expression={if($_.is_active){"Si"}else{"No"}}; Width=8},
        @{Name="Email Verificado"; Expression={if($_.email_verified){"Si"}else{"No"}}; Width=15},
        @{Name="Fecha Registro"; Expression={([DateTime]$_.created_at).ToString("dd/MM/yyyy HH:mm")}; Width=18}
    )
    
    # Estadisticas
    Write-Host ""
    Write-Host "ESTADISTICAS" -ForegroundColor Yellow
    Write-Host "--------------------" -ForegroundColor Gray
    
    $students = ($data.users | Where-Object {$_.role -eq "student"}).Count
    $instructors = ($data.users | Where-Object {$_.role -eq "instructor"}).Count
    $admins = ($data.users | Where-Object {$_.role -eq "admin"}).Count
    $verified = ($data.users | Where-Object {$_.email_verified -eq $true}).Count
    $active = ($data.users | Where-Object {$_.is_active -eq $true}).Count
    
    Write-Host "Total usuarios: $($data.count)" -ForegroundColor White
    Write-Host "Estudiantes: $students" -ForegroundColor Blue
    Write-Host "Instructores: $instructors" -ForegroundColor Green
    Write-Host "Administradores: $admins" -ForegroundColor Red
    Write-Host "Usuarios activos: $active" -ForegroundColor Green
    Write-Host "Emails verificados: $verified" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error al consultar usuarios: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Asegurate de que los servicios esten ejecutandose:" -ForegroundColor Yellow
    Write-Host "   - PostgreSQL (puerto 15432)" -ForegroundColor Gray
    Write-Host "   - Auth Service (puerto 4000)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Gray
Write-Host "Consulta completada" -ForegroundColor Green