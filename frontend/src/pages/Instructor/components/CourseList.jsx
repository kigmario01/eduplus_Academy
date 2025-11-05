import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseApi } from '@/lib/api';

const statusLabels = {
  published: { label: 'Publicado', classes: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' },
  draft: { label: 'Borrador', classes: 'bg-amber-500/20 text-amber-100 border border-amber-300/30' },
  archived: { label: 'Archivado', classes: 'bg-white/10 text-white/70 border border-white/20' }
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const params = filter !== 'all' ? { status: filter } : {};
      const response = await courseApi.get('/instructor/courses', { params });

      const payload = response.data?.data;
      if (!payload) {
        throw new Error('No se pudo obtener la información de cursos');
      }

      const normalized = Array.isArray(payload.courses)
        ? payload.courses.map((course) => ({
            id: course.id,
            title: course.title,
            status: course.status,
            enrollmentCount: parseInt(course.enrollment_count, 10) || 0,
            rating: course.rating,
            durationHours: course.duration_hours,
            category: course.category_name
          }))
        : [];

      setCourses(normalized);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'No se pudieron cargar los cursos.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filters = useMemo(() => ([
    { key: 'all', label: 'Todos' },
    { key: 'published', label: 'Publicados' },
    { key: 'draft', label: 'Borradores' },
    { key: 'archived', label: 'Archivados' }
  ]), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mis cursos</h2>
          <p className="text-sm text-white/70">Gestiona y mejora la experiencia educativa de tu comunidad</p>
        </div>
        <Link
          to="/instructor/create"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-pink-500/30 transition-transform hover:scale-[1.01]"
        >
          <span className="text-lg">＋</span>
          Nuevo curso
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((option) => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`px-4 py-2 rounded-xl border text-sm transition-all ${
              filter === option.key
                ? 'bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white border-white/30 shadow-lg shadow-pink-500/40'
                : 'bg-white/5 text-white/70 border-white/10 hover:text-white hover:border-pink-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!error && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const statusConfig = statusLabels[course.status] || statusLabels.draft;

            return (
              <motion.div
                key={course.id}
                whileHover={{ y: -6 }}
                className="relative overflow-hidden rounded-3xl bg-[#0f0824]/80 border border-white/10 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
                <div className="relative p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.2em] text-white/50">{course.category || 'Sin categoría'}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig.classes}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white leading-snug">{course.title}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
                    <div>
                      <p className="text-2xl font-bold text-white">{course.enrollmentCount}</p>
                      <p className="text-xs uppercase tracking-wide">Estudiantes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{course.rating ?? '—'}</p>
                      <p className="text-xs uppercase tracking-wide">Rating</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{course.durationHours || 0}h</p>
                      <p className="text-xs uppercase tracking-wide">Duración</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/instructor/edit/${course.id}`}
                      className="flex-1 rounded-xl bg-white/10 border border-white/20 text-sm py-2 text-center text-white/80 hover:text-white hover:border-pink-300 hover:bg-white/20 transition-colors"
                    >
                      Editar
                    </Link>
                    <Link
                      to={`/courses/${course.id}`}
                      className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-sm py-2 text-center font-medium shadow-lg shadow-indigo-500/30"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : null}

      {!error && courses.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center text-white/60">
          <p className="text-lg">Aún no tienes cursos en esta categoría.</p>
          <p className="text-sm mt-2">Crea un nuevo curso para comenzar a compartir tu conocimiento.</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;
