import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { courseApi } from '@/lib/api';
import { TrendingUp, Users, BarChart3, Star, PieChart, Activity } from 'lucide-react';

const SummaryCard = ({ title, value, description, icon: Icon, gradient }) => (
  <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-[1px] shadow-xl`}>
    <div className="bg-[#0f0824]/95 rounded-3xl px-6 py-5 h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
          <p className="text-3xl font-bold text-white mt-3">{value}</p>
          <p className="text-sm text-white/70 mt-2">{description}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white/10 text-white">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  </div>
);

const CourseAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await courseApi.get('/instructor/analytics');
        const data = response.data?.data;
        if (!data) {
          throw new Error('No se pudo obtener la información de analíticas');
        }

        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'No se pudieron cargar las analíticas.');
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const monthlyStats = analytics.monthlyStats ?? [];
  const weeklyProgress = analytics.weeklyProgress ?? [];
  const topCourses = analytics.topCourses ?? [];
  const recentActivity = analytics.recentActivity ?? [];

  return (
    <div className="space-y-8 text-white">
      <div className="relative overflow-hidden rounded-3xl bg-[#150b2e]/80 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/30 via-indigo-500/20 to-fuchsia-600/20 blur-3xl" />
        <div className="relative px-8 py-10">
          <h1 className="text-3xl font-bold text-white">Analíticas en tiempo real</h1>
          <p className="text-white/70 mt-3 max-w-2xl">
            Visualiza cómo interactúan tus estudiantes con los cursos, identifica oportunidades de mejora y celebra los logros que estás generando en tu comunidad educativa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <SummaryCard
          title="Estudiantes"
          value={analytics.totalStudents}
          description="Personas aprendiendo contigo"
          icon={Users}
          gradient="from-emerald-400 via-green-500 to-teal-500"
        />
        <SummaryCard
          title="Cursos"
          value={analytics.totalCourses}
          description="Total de cursos creados"
          icon={BarChart3}
          gradient="from-sky-400 via-cyan-500 to-indigo-500"
        />
        <SummaryCard
          title="Cursos activos"
          value={analytics.activeCourses}
          description="Actualmente publicados"
          icon={Activity}
          gradient="from-violet-400 via-purple-500 to-fuchsia-500"
        />
        <SummaryCard
          title="Calificación"
          value={analytics.averageRating}
          description="Promedio general"
          icon={Star}
          gradient="from-amber-400 via-orange-500 to-rose-500"
        />
        <SummaryCard
          title="Finalización"
          value={`${analytics.completionRate}%`}
          description="Tasa de finalización"
          icon={TrendingUp}
          gradient="from-pink-400 via-rose-500 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0824]/80 border border-white/10 rounded-3xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Rendimiento mensual</h2>
          <div className="space-y-4">
            {monthlyStats.length > 0 ? (
              monthlyStats.map((month) => (
                <div key={month.month} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{month.month.trim()}</p>
                    <p className="text-xs text-white/60">Estudiantes únicos: {month.students}</p>
                  </div>
                  <div className="text-right text-sm text-white/70">
                    <p>Inscripciones: <span className="text-white font-semibold">{month.enrollments}</span></p>
                    <p>Completados: <span className="text-emerald-200 font-semibold">{month.completions}</span></p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">Aún no hay datos mensuales suficientes.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0824]/80 border border-white/10 rounded-3xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Progreso semanal</h2>
          <div className="space-y-3">
            {weeklyProgress.length > 0 ? (
              weeklyProgress.map((day, index) => {
                const parsed = Number.parseFloat(day.hours ?? 0);
                const hours = Number.isFinite(parsed) ? parsed : 0;
                return (
                  <div key={`${day.day}-${index}`} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-white/60 uppercase tracking-[0.2em]">{day.day}</div>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600"
                        style={{ width: `${Math.min(100, Math.round((hours || 0) / 6 * 100))}%` }}
                      />
                    </div>
                    <div className="text-sm text-white/70 min-w-[90px] text-right">
                      {hours.toFixed(1)} h · {day.students} estudiantes
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-white/60">No hay actividad registrada esta semana.</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0824]/80 border border-white/10 rounded-3xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Cursos destacados</h2>
          <div className="space-y-4">
            {topCourses.length > 0 ? (
              topCourses.map((course) => (
                <div key={course.id} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <p className="text-lg font-semibold text-white">{course.title}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/70">
                    <span>Estudiantes: <strong className="text-white">{course.students}</strong></span>
                    <span>Completados: <strong className="text-emerald-200">{course.completions}</strong></span>
                    <span>Rating: <strong className="text-amber-200">{course.rating}</strong></span>
                    {course.category && <span className="text-xs uppercase tracking-[0.2em] text-white/50">{course.category}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">Aún no hay cursos con actividad suficiente.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0824]/80 border border-white/10 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Actividad reciente</h2>
            <PieChart className="w-5 h-5 text-white/70" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 8).map((event, index) => (
                <div key={`${event.type}-${index}`} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="text-2xl">
                    {event.type === 'enrollment' ? '🆕' : event.type === 'completion' ? '✅' : '⭐'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80 font-medium">{event.actorName || 'Estudiante'}</p>
                    <p className="text-xs text-white/50">
                      {event.type === 'enrollment' && 'se inscribió en'}
                      {event.type === 'completion' && 'completó'}
                      {event.type === 'review' && 'dejó reseña en'}
                      {` "${event.courseTitle}"`}
                    </p>
                  </div>
                  <div className="text-xs text-white/60">
                    {event.occurredAt ? new Date(event.occurredAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No hay actividad reciente registrada.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
