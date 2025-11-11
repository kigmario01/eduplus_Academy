import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseApi as api } from '@/lib/api';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
    priceRange: 'all',
    includeDrafts: false
  });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filters.category && { category: filters.category }),
        ...(filters.level && { level: filters.level }),
        ...(filters.search && { search: filters.search }),
        ...(filters.priceRange && filters.priceRange !== 'all' && { priceRange: filters.priceRange }),
        // Mostrar borradores cuando el usuario lo indique
        status: filters.includeDrafts ? 'all' : 'published'
      };
      
      const response = await api.get('/courses', { params });
      const coursesData = Array.isArray(response?.data?.data?.courses)
        ? response.data.data.courses
        : [];

      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoriesData = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data?.categories)
          ? response.data.categories
          : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      beginner: { color: 'bg-green-100 text-green-800', text: 'Principiante' },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', text: 'Intermedio' },
      advanced: { color: 'bg-red-100 text-red-800', text: 'Avanzado' }
    };
    
    const config = levelConfig[level] || levelConfig.beginner;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Cursos</h1>
          <p className="text-gray-600 mt-2">Descubre y aprende con nuestros cursos especializados</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar cursos..."
                />
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nivel */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los niveles</option>
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              {/* Precio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los precios</option>
                  <option value="free">Gratis</option>
                  <option value="0-50">$0 - $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="100+">$100+</option>
                </select>
              </div>

              {/* Mostrar borradores */}
              <div className="mb-6 flex items-center gap-2">
                <input
                  id="includeDrafts"
                  type="checkbox"
                  checked={filters.includeDrafts}
                  onChange={(e) => handleFilterChange('includeDrafts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeDrafts" className="text-sm text-gray-700">
                  Mostrar cursos en borrador (solo visible en desarrollo)
                </label>
              </div>

              <button
                onClick={() => setFilters({ category: '', level: '', search: '', priceRange: 'all', includeDrafts: false })}
                className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Resultados */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    {courses.length} curso{courses.length !== 1 ? 's' : ''} encontrado{courses.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Grid de cursos */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <Link to={`/courses/${course.slug}`}>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            {getLevelBadge(course.level)}
                          </div>
                          <div className="absolute top-3 left-3">
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: course.category_color }}
                            >
                              {course.category_name}
                            </span>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {course.short_description}
                          </p>

                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span>{course.instructor_name} {course.instructor_lastname}</span>
                          </div>

                          {/* Rating y estadísticas */}
                          <div className="flex items-center justify-between mb-4">
                            {renderStars(course.rating)}
                            <div className="text-sm text-gray-500">
                              {course.total_students} estudiantes
                            </div>
                          </div>

                          {/* Duración y precio */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {course.duration_hours}h de contenido
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {course.price === 0 ? 'Gratis' : `$${course.price}`}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {courses.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Cursos Próximamente</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {filters.search || filters.category || filters.level 
                        ? 'No se encontraron cursos con los filtros seleccionados. Intenta ajustar tu búsqueda.'
                        : 'Estamos trabajando en traerte contenido educativo increíble. ¡Mantente atento a nuestros próximos lanzamientos!'
                      }
                    </p>
                    {(!filters.search && !filters.category && !filters.level) && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-400">
                          🚀 ¡Grandes cosas están por venir!
                        </p>
                        <Link 
                          to="/instructor" 
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          ¿Eres instructor? Crea el primer curso
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;