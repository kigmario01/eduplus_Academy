import { motion } from 'framer-motion';
import EmptyState from '../../../components/EmptyState';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${color}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-l-4', 'bg-opacity-20 bg')}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const CourseCard = ({ course }) => {
  const completed = Number(course.completedLessons || 0);
  const total = Number(course.totalLessons || 0);
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
        {course.image ? (
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Sin imagen
          </div>
        )}
        {course.category && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {course.category}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">{course.title}</h3>
        {course.instructor && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.instructor}</p>
        )}

        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-300">Progreso</span>
            <span className="text-blue-600 dark:text-blue-400">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {completed} / {total} lecciones
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Continuar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ activity }) => (
  <div className="flex items-start space-x-3 py-3">
    <div
      className={`mt-1 p-1.5 rounded-full ${
        activity.type === 'completion'
          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
          : activity.type === 'enrollment'
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
          : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
      }`}
    >
      {activity.type === 'completion' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : activity.type === 'enrollment' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.809-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
    <div>
      <p className="text-sm text-gray-800 dark:text-gray-200">{activity.text}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
    </div>
  </div>
);

const DashboardOverview = ({ user, summary, courses, activities, isLoading, error, onRetry, hasData }) => {
  const stats = [
    {
      title: 'Horas de Estudio',
      value: summary?.hoursStudied !== null ? String(summary.hoursStudied) : '--',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
        </svg>
      ),
      color: 'border-l-4 border-blue-500',
    },
    {
      title: 'Cursos Completados',
      value: summary?.completedCourses !== null ? String(summary.completedCourses) : '--',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'border-l-4 border-green-500',
    },
    {
      title: 'Certificados',
      value: summary?.certificates !== null ? String(summary.certificates) : '--',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806A3.42 3.42 0 013.697 16.165a3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946A3.42 3.42 0 017.835 4.697z"
          />
        </svg>
      ),
      color: 'border-l-4 border-yellow-500',
    },
    {
      title: 'Puntos',
      value: summary?.points !== null ? String(summary.points) : '--',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'border-l-4 border-purple-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
  };

  const displayName = user?.name || 'Estudiante';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
      <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Bienvenido de vuelta, {displayName}
      </motion.h2>

      {error && (
        <motion.div
          variants={itemVariants}
          className="mb-4 p-3 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
          >
            Reintentar
          </button>
        </motion.div>
      )}

      {!hasData && !error && !isLoading && (
        <motion.div variants={itemVariants} className="mb-8">
          <EmptyState
            icon="🎓"
            title="Datos del dashboard no disponibles"
            description="Los datos de tu progreso académico aún no están disponibles. Esto puede deberse a que el servidor no está conectado o aún no has comenzado ningún curso."
            action={
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Intentar cargar datos
              </button>
            }
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cursos en Progreso</h3>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/dashboard/courses"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Ver todos
            </motion.a>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <CourseCard key={course.id || course._id || course.title} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-gray-600 dark:text-gray-300">Aún no tienes cursos en progreso.</p>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Actividad Reciente</h3>

            {activities.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id || activity._id || activity.text} activity={activity} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Sin actividad reciente.</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full py-2 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-200"
            >
              Ver todo el historial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
