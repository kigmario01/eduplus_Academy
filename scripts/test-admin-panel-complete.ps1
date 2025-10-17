# Script completo para probar el panel de administrador
Write-Host "Probando panel de administrador completo..." -ForegroundColor Green

$authServiceUrl = "http://localhost:4000"
$courseServiceUrl = "http://localhost:3001"
$adminEmail = "temp.admin@eduplus.com"
$adminPassword = "TempAdmin123!"

Write-Host "`n1. Probando login de administrador..." -ForegroundColor Yellow

try {
    $loginData = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$authServiceUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "   Login exitoso" -ForegroundColor Green
        Write-Host "   Usuario: $($loginResponse.user.name) $($loginResponse.user.lastname)" -ForegroundColor Cyan
        Write-Host "   Rol: $($loginResponse.user.role)" -ForegroundColor Cyan
        
        $token = $loginResponse.token
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Test 2: Obtener estadisticas de usuarios (Auth Service)
        Write-Host "`n2. Probando estadisticas de usuarios..." -ForegroundColor Yellow
        try {
            $userStats = Invoke-RestMethod -Uri "$authServiceUrl/api/admin/users/stats" -Method GET -Headers $headers
            Write-Host "   Estadisticas obtenidas:" -ForegroundColor Green
            Write-Host "   Total usuarios: $($userStats.totalUsers)" -ForegroundColor Cyan
            Write-Host "   Estudiantes: $($userStats.totalStudents)" -ForegroundColor Cyan
            Write-Host "   Instructores: $($userStats.totalInstructors)" -ForegroundColor Cyan
            Write-Host "   Administradores: $($userStats.totalAdmins)" -ForegroundColor Cyan
        } catch {
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 3: Obtener lista de usuarios (Auth Service)
        Write-Host "`n3. Probando lista de usuarios..." -ForegroundColor Yellow
        try {
            $usersUrl = "$authServiceUrl/api/admin/users?page=1&limit=5"
            $users = Invoke-RestMethod -Uri $usersUrl -Method GET -Headers $headers
            Write-Host "   Lista obtenida:" -ForegroundColor Green
            Write-Host "   Total: $($users.total)" -ForegroundColor Cyan
            Write-Host "   Pagina: $($users.page) de $($users.totalPages)" -ForegroundColor Cyan
            Write-Host "   Usuarios en esta pagina: $($users.users.Count)" -ForegroundColor Cyan
        } catch {
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 4: Verificar si course service esta disponible
        Write-Host "`n4. Verificando course service..." -ForegroundColor Yellow
        try {
            $courseHealth = Invoke-RestMethod -Uri "$courseServiceUrl/health" -Method GET
            Write-Host "   Course service disponible: $($courseHealth.status)" -ForegroundColor Green
            
            # Test 5: Obtener estadisticas de cursos (Course Service)
            Write-Host "`n5. Probando estadisticas de cursos..." -ForegroundColor Yellow
            try {
                $courseStats = Invoke-RestMethod -Uri "$courseServiceUrl/api/admin/courses/stats" -Method GET -Headers $headers
                Write-Host "   Estadisticas obtenidas:" -ForegroundColor Green
                Write-Host "   Total cursos: $($courseStats.totalCourses)" -ForegroundColor Cyan
                Write-Host "   Publicados: $($courseStats.publishedCourses)" -ForegroundColor Cyan
                Write-Host "   Borradores: $($courseStats.draftCourses)" -ForegroundColor Cyan
            } catch {
                Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # Test 6: Obtener lista de cursos (Course Service)
            Write-Host "`n6. Probando lista de cursos..." -ForegroundColor Yellow
            try {
                $coursesUrl = "$courseServiceUrl/api/admin/courses?page=1&limit=3"
                $courses = Invoke-RestMethod -Uri $coursesUrl -Method GET -Headers $headers
                Write-Host "   Lista obtenida:" -ForegroundColor Green
                Write-Host "   Total: $($courses.total)" -ForegroundColor Cyan
                Write-Host "   Cursos en esta pagina: $($courses.courses.Count)" -ForegroundColor Cyan
            } catch {
                Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "   Course service no disponible: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "   Login fallido: No se recibio token" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPruebas completadas" -ForegroundColor Green
Write-Host "Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Email: $adminEmail" -ForegroundColor Cyan
Write-Host "   Password: $adminPassword" -ForegroundColor Cyan
Write-Host "`nServicios:" -ForegroundColor Yellow
Write-Host "   Auth Service: $authServiceUrl" -ForegroundColor Cyan
Write-Host "   Course Service: $courseServiceUrl" -ForegroundColor Cyan
Write-Host "   Panel admin: http://localhost:3000/admin" -ForegroundColor Magenta