import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente que redirige al flujo de creación de cursos
 * Mantiene compatibilidad con rutas antiguas
 */
const CreateCourseRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al nuevo flujo de creación de cursos
    navigate('/instructor/create-course', { replace: true });
  }, [navigate]);

  return null;
};

export default CreateCourseRedirect;