import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamada real a la API
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/instructor/courses', { params });
      
      const coursesData = Array.isArray(response?.data?.items) 
        ? response.data.items 
        : response?.data || [];
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('No se pudieron cargar los cursos. Verifica tu conexión.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', text: 'Publicado' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Borrador' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Archivado' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
          <p className="text-gray-600">Gestiona y edita tus cursos</p>
        </div>
        <Link
          to="/instructor/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Nuevo Curso
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'published', label: 'Publicados' },
            { key: 'draft', label: 'Borradores' },
            { key: 'archived', label: 'Archivados' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar cursos</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchCourses}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {!error && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gray-200 relative">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(course.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{course.students || 0}</div>
                    <div className="text-gray-500">Estudiantes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{course.rating || '—'}</div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">${course.revenue || 0}</div>
                    <div className="text-gray-500">Ingresos</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    to={`/instructor/edit/${course.id}`}
                    className="flex-1 bg-blue-50 text-blue-700 text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Editar
                  </Link>
                  <button className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
                    Ver
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !error && !loading ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Cursos Próximamente</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Aún no tienes cursos creados. Utiliza el editor de cursos para crear contenido educativo increíble.
          </p>
          <div className="space-y-3">
            <Link
              to="/instructor/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Tu Primer Curso
            </Link>
            <p className="text-sm text-gray-400">
              ¡Comparte tu conocimiento con el mundo!
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CourseList;