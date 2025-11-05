import { motion } from 'framer-motion';

const MyCourses = ({ courses, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 text-white">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Mis cursos</h2>
          <p className="text-sm text-white/60">Gestiona tus cursos inscritos y continúa tu aprendizaje.</p>
        </div>
        <motion.a
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          href="/dashboard/courses/explore"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 px-5 py-2 text-sm font-semibold text-[#0b0522] shadow-lg"
        >
          Explorar nuevos cursos
        </motion.a>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-100">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
          >
            Reintentar
          </button>
        </div>
      )}

      {courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <motion.div
              key={course.id || course._id || course.title}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="relative h-40 w-full overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/40">Sin imagen</div>
                )}
                {course.category && (
                  <span className="absolute left-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    {course.category}
                  </span>
                )}
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                  {course.instructor && <p className="mt-1 text-xs text-white/60">{course.instructor}</p>}
                  {course.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-white/70">{course.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>
                    {course.completedLessons || 0} / {course.totalLessons || 0} lecciones
                  </span>
                  <span>{course.progress ? `${course.progress}%` : 'Sin progreso'}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/20"
                >
                  Continuar curso
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-white/70">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">📚</div>
          <div>
            <h3 className="text-lg font-semibold text-white">No hay cursos inscritos</h3>
            <p className="text-sm text-white/60">
              Cuando te inscribas en un curso aparecerá aquí para que puedas retomarlo fácilmente.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href="/dashboard/courses/explore"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 px-5 py-2 text-sm font-semibold text-[#0b0522] shadow-lg"
          >
            Buscar cursos disponibles
          </motion.a>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
