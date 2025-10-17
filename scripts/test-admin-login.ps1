# Script para probar el login del administrador y funcionalidades del panel admin
Write-Host "🔐 Probando funcionalidades del panel de administrador..." -ForegroundColor Green

# Configuración
$baseUrl = "http://localhost:4000"
$adminEmail = "temp.admin@eduplus.com"
$adminPassword = "TempAdmin123!"

Write-Host "`n1️⃣ Probando login de administrador..." -ForegroundColor Yellow

# Test 1: Login de administrador
try {
    $loginData = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "   ✅ Login exitoso" -ForegroundColor Green
        Write-Host "   👤 Usuario: $($loginResponse.user.name) $($loginResponse.user.lastname)" -ForegroundColor Cyan
        Write-Host "   🔑 Rol: $($loginResponse.user.role)" -ForegroundColor Cyan
        
        $token = $loginResponse.token
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Test 2: Obtener estadísticas de usuarios
        Write-Host "`n2️⃣ Probando obtención de estadísticas de usuarios..." -ForegroundColor Yellow
        try {
            $userStats = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/stats" -Method GET -Headers $headers
            Write-Host "   ✅ Estadísticas obtenidas:" -ForegroundColor Green
            Write-Host "   📊 Total usuarios: $($userStats.totalUsers)" -ForegroundColor Cyan
            Write-Host "   👨‍🎓 Estudiantes: $($userStats.totalStudents)" -ForegroundColor Cyan
            Write-Host "   👨‍🏫 Instructores: $($userStats.totalInstructors)" -ForegroundColor Cyan
            Write-Host "   👑 Administradores: $($userStats.totalAdmins)" -ForegroundColor Cyan
        } catch {
            Write-Host "   ❌ Error obteniendo estadísticas de usuarios: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 3: Obtener lista de usuarios
        Write-Host "`n3️⃣ Probando obtención de lista de usuarios..." -ForegroundColor Yellow
        try {
            $usersUrl = "$baseUrl/api/admin/users?page=1`&limit=5"
            $users = Invoke-RestMethod -Uri $usersUrl -Method GET -Headers $headers
            Write-Host "   ✅ Lista de usuarios obtenida:" -ForegroundColor Green
            Write-Host "   📋 Total: $($users.total)" -ForegroundColor Cyan
            Write-Host "   📄 Página: $($users.page) de $($users.totalPages)" -ForegroundColor Cyan
            
            if ($users.users.Count -gt 0) {
                Write-Host "   👥 Primeros usuarios:" -ForegroundColor Cyan
                foreach ($user in $users.users[0..2]) {
                    Write-Host "      - $($user.name) $($user.lastname) ($($user.email)) - $($user.role)" -ForegroundColor Gray
                }
            }
        } catch {
            Write-Host "   ❌ Error obteniendo lista de usuarios: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 4: Obtener estadísticas de cursos
        Write-Host "`n4️⃣ Probando obtención de estadísticas de cursos..." -ForegroundColor Yellow
        try {
            $courseStats = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/stats" -Method GET -Headers $headers
            Write-Host "   ✅ Estadísticas de cursos obtenidas:" -ForegroundColor Green
            Write-Host "   📚 Total cursos: $($courseStats.totalCourses)" -ForegroundColor Cyan
            Write-Host "   ✅ Publicados: $($courseStats.publishedCourses)" -ForegroundColor Cyan
            Write-Host "   📝 Borradores: $($courseStats.draftCourses)" -ForegroundColor Cyan
        } catch {
            Write-Host "   ❌ Error obteniendo estadísticas de cursos: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 5: Obtener lista de cursos
        Write-Host "`n5️⃣ Probando obtención de lista de cursos..." -ForegroundColor Yellow
        try {
            $coursesUrl = "$baseUrl/api/admin/courses?page=1`&limit=3"
            $courses = Invoke-RestMethod -Uri $coursesUrl -Method GET -Headers $headers
            Write-Host "   ✅ Lista de cursos obtenida:" -ForegroundColor Green
            Write-Host "   📋 Total: $($courses.total)" -ForegroundColor Cyan
            
            if ($courses.courses.Count -gt 0) {
                Write-Host "   📚 Primeros cursos:" -ForegroundColor Cyan
                foreach ($course in $courses.courses) {
                    Write-Host "      - $($course.title) - $($course.status) - Instructor: $($course.instructor_name)" -ForegroundColor Gray
                }
            }
        } catch {
            Write-Host "   ❌ Error obteniendo lista de cursos: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "   ❌ Login fallido: No se recibió token" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   🔍 Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Pruebas del panel de administrador completadas" -ForegroundColor Green
Write-Host "📝 Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Email: $adminEmail" -ForegroundColor Cyan
Write-Host "   Password: $adminPassword" -ForegroundColor Cyan
Write-Host "`n🌐 Accede al panel admin en: http://localhost:3000/admin" -ForegroundColor Magenta