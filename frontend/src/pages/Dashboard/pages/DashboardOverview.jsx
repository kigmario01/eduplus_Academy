import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../../../components/EmptyState';

const StatCard = ({ title, value, description, gradient, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-[1px] shadow-xl`}
  >
    <div className="h-full w-full rounded-2xl bg-[#0b0522]/90 p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">{title}</p>
          <p className="mt-3 text-3xl font-bold">{value}</p>
          {description && <p className="mt-2 text-xs text-white/60">{description}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">{icon}</div>
      </div>
    </div>
  </motion.div>
);

const CourseCard = ({ course }) => {
  const completed = Number(course.completedLessons || 0);
  const total = Number(course.totalLessons || 0);
  const progressPercentage = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      <div className="relative h-36 w-full overflow-hidden">
        {course.image ? (
          <img src={course.image} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/40">Sin imagen</div>
        )}
        {course.category && (
          <span className="absolute left-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-white shadow-lg">
            {course.category}
          </span>
        )}
      </div>
      <div className="space-y-4 p-5 text-white">
        <div>
          <h3 className="text-lg font-semibold leading-tight">{course.title}</h3>
          {course.instructor && <p className="mt-1 text-xs text-white/60">{course.instructor}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Progreso</span>
            <span className="font-semibold text-emerald-300">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-white/40">
            {completed} / {total} lecciones
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/20"
        >
          Continuar curso
        </motion.button>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-white/80">
    <div
      className={`mt-1 flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
        activity.type === 'completion'
          ? 'bg-emerald-500/20 text-emerald-300'
          : activity.type === 'enrollment'
          ? 'bg-sky-500/20 text-sky-300'
          : 'bg-fuchsia-500/20 text-fuchsia-300'
      }`}
    >
      {activity.type === 'completion' ? '🎉' : activity.type === 'enrollment' ? '📘' : '💬'}
    </div>
    <div>
      <p className="text-sm text-white">{activity.text}</p>
      <p className="mt-1 text-xs text-white/50">{activity.time}</p>
    </div>
  </div>
);

const DashboardOverview = ({ user, summary, courses, activities, isLoading, error, onRetry, hasData }) => {
  const stats = [
    {
      title: 'Horas de estudio',
      value: summary?.hoursStudied !== null ? String(summary.hoursStudied) : '--',
      description: 'Tiempo total invertido en tus cursos',
      gradient: 'from-emerald-400 via-teal-400 to-sky-500',
      icon: '⏱️'
    },
    {
      title: 'Cursos completados',
      value: summary?.completedCourses !== null ? String(summary.completedCourses) : '--',
      description: 'Experiencias que ya terminaste',
      gradient: 'from-fuchsia-400 via-purple-500 to-violet-500',
      icon: '🏆'
    },
    {
      title: 'Certificados',
      value: summary?.certificates !== null ? String(summary.certificates) : '--',
      description: 'Reconocimientos obtenidos',
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      icon: '📜'
    },
    {
      title: 'Puntos acumulados',
      value: summary?.points !== null ? String(summary.points) : '--',
      description: 'Sigue aprendiendo para desbloquear más',
      gradient: 'from-sky-400 via-cyan-400 to-emerald-400',
      icon: '⭐'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: 'easeOut' }
    }
  };

  const displayName = user?.full_name || user?.name || user?.email || 'Estudiante';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto flex max-w-7xl flex-col gap-8 text-white"
    >
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#150b2e]/80 p-10 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 via-amber-400/10 to-sky-500/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr,1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Progreso general</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
              {displayName}, sigue creando tu historia de aprendizaje ✨
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-white/70">
              Retoma tus cursos, sigue aprendiendo a tu ritmo y alcanza tus metas con una experiencia pensada para inspirarte cada día.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/50">
              <span className="rounded-full border border-white/10 px-3 py-1">Aprendizaje personalizado</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Metas alcanzables</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Evolución constante</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Resumen rápido</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/80">
                <span>Horas de estudio</span>
                <strong className="text-white">{summary?.hoursStudied ?? '--'}</strong>
              </div>
              <div className="flex items-center justify-between text-white/80">
                <span>Cursos activos</span>
                <strong className="text-white">{courses.length}</strong>
              </div>
              <div className="flex items-center justify-between text-white/80">
                <span>Actividad reciente</span>
                <strong className="text-white">{activities.length}</strong>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 py-2 text-sm font-semibold text-[#0b0522] shadow-lg"
            >
              Continuar aprendiendo
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>{error && (
        <motion.div
          key="dashboard-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-100"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
          >
            Reintentar
          </button>
        </motion.div>
      )}</AnimatePresence>

      {!hasData && !error && (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon="🎓"
            title="Aún no hay datos para mostrar"
            description="Cuando comiences a avanzar en tus cursos verás tu progreso, logros y recomendaciones personalizadas en este espacio."
            action={
              <button
                onClick={onRetry}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Intentar nuevamente
              </button>
            }
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:col-span-2">
          <div className="flex items-center justify-between text-white/80">
            <div>
              <h3 className="text-lg font-semibold text-white">Cursos en progreso</h3>
              <p className="text-sm text-white/60">Retoma tus cursos activos y continúa donde te quedaste.</p>
            </div>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              href="/dashboard/courses"
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Ver todos
            </motion.a>
          </div>

          {courses.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id || course._id || course.title} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-white/60">
              Aún no tienes cursos en progreso.
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Actividad reciente</h3>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Últimos 10 eventos</span>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id || activity._id || activity.text} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">Sin actividad reciente.</p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-xl bg-white/10 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Ver historial completo
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
