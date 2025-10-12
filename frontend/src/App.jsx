import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages for better initial bundle
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));

// Componente para manejar las transiciones de página
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Determinar si estamos en una ruta de dashboard
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  
  // Scroll al inicio cuando cambia la ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      {isDashboardRoute ? (
        // Rutas del dashboard (sin Navbar ni Footer)
        <Suspense fallback={<div className="flex items-center justify-center h-48">Cargando...</div>}>
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
          </Routes>
        </Suspense>
      ) : (
        // Rutas públicas (con Navbar y Footer)
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<div className="flex items-center justify-center h-48">Cargando...</div>}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Suspense>
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