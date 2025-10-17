import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import CourseCatalog from './pages/Courses/CourseCatalog';
import CourseDetail from './pages/Courses/CourseDetail';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/api';

// Componente para manejar las transiciones de página
const AnimatedRoutes = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState('student');
  
  // Determinar si estamos en una ruta de dashboard, instructor o admin
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                           location.pathname.startsWith('/instructor') || 
                           location.pathname.startsWith('/admin');
  
  // Obtener el rol del usuario
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role) {
      setUserRole(currentUser.role);
    }
  }, [location.pathname]);
  
  // Scroll al inicio cuando cambia la ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {isDashboardRoute ? (
        // Rutas del dashboard (sin Navbar ni Footer)
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor" 
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/*" 
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      ) : (
        // Rutas públicas (con Navbar y Footer)
        <div className="flex flex-col min-h-screen">
          <Navbar userRole={userRole} />
          <main className="flex-grow">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:slug" element={<CourseDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;