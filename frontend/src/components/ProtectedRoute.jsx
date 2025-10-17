import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Verificar si el token ha expirado
    try {
      // Decodificar el token JWT (simplificado)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Verificar expiración
      if (payload.exp * 1000 < Date.now()) {
        // Token expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verificar rol si es necesario
      if (requiredRole) {
        if (Array.isArray(requiredRole)) {
          // Si requiredRole es un array, verificar si el usuario tiene alguno de los roles
          setHasRequiredRole(requiredRole.includes(user.role));
        } else {
          // Si requiredRole es un string, verificar coincidencia exacta
          setHasRequiredRole(user.role === requiredRole);
        }
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al verificar el token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole) {
    // Redirigir según el rol del usuario
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const redirectPath = user.role === 'instructor' ? '/instructor' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;