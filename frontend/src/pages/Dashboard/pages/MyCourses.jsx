import { motion } from 'framer-motion';

const MyCourses = ({ courses, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mis cursos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona tus cursos inscritos y continúa tu aprendizaje.
          </p>
        </div>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/dashboard/courses/explore"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          Explorar nuevos cursos
        </motion.a>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
          >
            Reintentar
          </button>
        </div>
      )}

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id || course._id || course.title}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-32 bg-gray-200 dark:bg-gray-700">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{course.title}</h3>
                {course.instructor && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{course.instructor}</p>
                )}
                {course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{course.description}</p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>{course.completedLessons || 0} / {course.totalLessons || 0} lecciones</span>
                  <span>{course.progress ? `${course.progress}%` : 'Sin progreso'}</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40"
                >
                  Continuar curso
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No hay cursos inscritos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Cuando te inscribas en un curso aparecerá aquí para que puedas retomarlo fácilmente.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/dashboard/courses/explore"
            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Buscar cursos disponibles
          </motion.a>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
