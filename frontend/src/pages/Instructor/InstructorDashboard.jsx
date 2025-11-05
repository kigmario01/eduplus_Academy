import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/api';
import { courseApi } from '@/lib/api';
import CourseList from './components/CourseList';
import CourseEditor from './components/CourseEditor';
import CourseAnalytics from './components/CourseAnalytics';
import StudentManagement from './components/StudentManagement';

const defaultStats = {
  totalCourses: 0,
  publishedCourses: 0,
  draftCourses: 0,
  totalStudents: 0,
  activeEnrollments: 0,
  completedEnrollments: 0,
  averageRating: '0.0',
  newStudents: 0,
  completionRate: 0
};

const InstructorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [instructor, setInstructor] = useState(null);
  const [stats, setStats] = useState(defaultStats);
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    setActiveTab(path === 'instructor' ? 'overview' : path);

    const user = authService.getCurrentUser();
    setInstructor(user);

    loadDashboardData();
  }, [location.pathname]);

  const displayName = useMemo(() => {
    if (!instructor) return 'Instructor';
    return instructor.full_name || `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim() || instructor.email || 'Instructor';
  }, [instructor]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await courseApi.get('/instructor/dashboard');
      const data = response.data?.data;

      if (!data) {
        throw new Error('Respuesta inválida del servidor');
      }

      setStats({ ...defaultStats, ...data.stats });
      setRecentCourses(Array.isArray(data.recentCourses) ? data.recentCourses : []);
      setRecentActivity(Array.isArray(data.recentActivity) ? data.recentActivity : []);
    } catch (err) {
      console.error('Error loading instructor dashboard:', err);
      setError(err.message || 'No se pudo cargar la información. Intenta nuevamente.');
      setStats(defaultStats);
      setRecentCourses([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: '📊', path: '/instructor' },
    { id: 'courses', name: 'Mis Cursos', icon: '🎥', path: '/instructor/courses' },
    { id: 'create', name: 'Crear Curso', icon: '✨', path: '/instructor/create' },
    { id: 'analytics', name: 'Analíticas', icon: '📈', path: '/instructor/analytics' },
    { id: 'students', name: 'Estudiantes', icon: '👥', path: '/instructor/students' }
  ];

  const OverviewContent = () => (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-[#150b2e]/80 border border-white/10 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-pink-500/20 to-fuchsia-600/20 blur-3xl" />
        <div className="relative px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm text-white/70 uppercase tracking-[0.2em]">Bienvenido de vuelta</p>
              <h2 className="text-4xl font-extrabold text-white mt-2">
                {displayName}, sigamos inspirando a tus estudiantes ✨
              </h2>
              <p className="text-white/60 mt-4 max-w-2xl">
                Controla el rendimiento de tus cursos, conecta con tus estudiantes y crea experiencias educativas inolvidables desde un mismo lugar.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 text-white min-w-[220px]">
              <p className="text-sm text-white/70">Tasa de finalización</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.completionRate}%</p>
              <p className="text-xs text-white/60 mt-2">Basado en inscripciones reales</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            title: 'Cursos publicados',
            value: stats.publishedCourses,
            description: 'Cursos disponibles para estudiantes',
            gradient: 'from-orange-400 via-pink-500 to-fuchsia-600',
            icon: '🚀'
          },
          {
            title: 'Estudiantes activos',
            value: stats.totalStudents,
            description: 'Personas aprendiendo contigo',
            gradient: 'from-sky-400 via-cyan-500 to-emerald-400',
            icon: '🧠'
          },
          {
            title: 'Cursos en progreso',
            value: stats.activeEnrollments,
            description: 'Inscripciones sin completar',
            gradient: 'from-violet-400 via-purple-500 to-indigo-500',
            icon: '⏳'
          },
          {
            title: 'Nuevos estudiantes (30 días)',
            value: stats.newStudents,
            description: 'Crecimiento reciente',
            gradient: 'from-amber-400 via-orange-500 to-rose-500',
            icon: '🌟'
          }
        ].map((card) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-[1px] shadow-xl`}
          >
            <div className="h-full w-full bg-[#0f0824]/95 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-3">{card.value}</p>
                  <p className="text-sm text-white/60 mt-2">{card.description}</p>
                </div>
                <div className="text-4xl">{card.icon}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-[#0f0824]/80 border border-white/5 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Tus cursos más recientes</h3>
              <p className="text-sm text-white/60">Últimos lanzamientos y su desempeño</p>
            </div>
            <Link
              to="/instructor/courses"
              className="text-sm text-pink-300 hover:text-pink-200 transition-colors"
            >
              Ver todos
            </Link>
          </div>
          {recentCourses.length > 0 ? (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4"
                >
                  <div>
                    <p className="text-lg font-semibold text-white">{course.title}</p>
                    <p className="text-sm text-white/60">{new Date(course.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-white/70">
                    <span className="flex items-center gap-2"><span className="text-xl">🎯</span>{course.enrollmentCount} estudiantes</span>
                    <span className="flex items-center gap-2"><span className="text-xl">⭐</span>{course.rating}</span>
                    <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide ${
                      course.status === 'published'
                        ? 'bg-green-500/20 text-green-200 border border-green-300/30'
                        : course.status === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-300/30'
                          : 'bg-white/10 text-white border border-white/20'
                    }`}>
                      {course.status === 'published' ? 'Publicado' : course.status === 'draft' ? 'Borrador' : 'Archivado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-10 text-center text-white/60">
              <p className="text-lg">Aún no hay cursos recientes.</p>
              <p className="text-sm mt-2">Crea un nuevo curso y aparecerá aquí cuando lo publiques.</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f0824]/80 border border-white/5 rounded-3xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Actividad reciente</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 6).map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="text-2xl">
                    {activity.type === 'enrollment' ? '🆕' : activity.type === 'completion' ? '✅' : '⭐'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80 font-medium">
                      {activity.actorName || 'Estudiante'}
                    </p>
                    <p className="text-xs text-white/50">
                      {activity.type === 'enrollment' && 'se inscribió en'}
                      {activity.type === 'completion' && 'completó'}
                      {activity.type === 'review' && 'dejó reseña en'}
                      {` "${activity.courseTitle}"`}
                    </p>
                  </div>
                  <p className="text-xs text-white/50">
                    {activity.occurredAt ? new Date(activity.occurredAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-white/60">No hay actividad reciente registrada.</div>
            )}
          </div>
          <div className="mt-6">
            <h4 className="text-sm uppercase tracking-[0.2em] text-white/60">Acciones rápidas</h4>
            <div className="mt-4 space-y-3">
              {[{
                title: 'Crear nuevo curso',
                description: 'Comparte tus conocimientos con la comunidad',
                to: '/instructor/create',
                gradient: 'from-orange-400 via-pink-500 to-fuchsia-600'
              },
              {
                title: 'Gestionar estudiantes',
                description: 'Supervisa el avance y motiva a tus alumnos',
                to: '/instructor/students',
                gradient: 'from-sky-400 via-indigo-500 to-purple-500'
              }].map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className={`block rounded-2xl border border-white/10 bg-gradient-to-r ${action.gradient} p-[1px] shadow-lg hover:shadow-pink-500/20 transition-shadow`}
                >
                  <div className="bg-[#0f0824]/95 rounded-2xl px-4 py-3 text-sm text-white">
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-white/70 text-xs mt-1">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0121] via-[#160238] to-[#040111] text-white">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 flex items-center justify-center text-2xl shadow-lg">
              🎓
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Instructor</h1>
              <p className="text-sm text-white/70">Gestiona tus cursos, estudiantes y analíticas en un entorno elegante</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-white/60">Sesión activa</p>
              <p className="text-sm font-semibold text-white">{displayName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-sm text-white/80 hover:text-white hover:border-pink-300 hover:bg-white/20 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap gap-3 py-4">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 border ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white border-white/30 shadow-lg shadow-pink-500/30'
                    : 'bg-white/5 text-white/70 border-white/10 hover:text-white hover:border-pink-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-pink-400 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <Routes>
                <Route index element={<OverviewContent />} />
                <Route path="courses" element={<CourseList />} />
                <Route path="create" element={<CourseEditor />} />
                <Route path="edit/:id" element={<CourseEditor />} />
                <Route path="analytics" element={<CourseAnalytics />} />
                <Route path="students" element={<StudentManagement />} />
              </Routes>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstructorDashboard;
