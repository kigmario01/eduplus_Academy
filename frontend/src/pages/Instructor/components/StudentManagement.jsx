import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { courseApi } from '@/lib/api';

const defaultSummary = { totalStudents: 0, activeStudents: 0, inactiveStudents: 0, completedStudents: 0 };

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await courseApi.get('/instructor/students', {
        params: {
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });

      const data = response.data?.data;
      if (!data) {
        throw new Error('No se pudo obtener la información de estudiantes');
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
      setSummary(data.summary || defaultSummary);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'No se pudieron cargar los estudiantes.');
      setStudents([]);
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = useMemo(() => {
    const options = new Set();
    students.forEach((student) => {
      (student.courses || []).forEach((course) => options.add(course.title));
    });
    return ['all', ...Array.from(options)];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesCourse = courseFilter === 'all' || (student.courses || []).some((course) => course.title === courseFilter);
      return matchesCourse;
    });
  }, [students, courseFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="relative overflow-hidden rounded-3xl bg-[#150b2e]/80 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-sky-500/20 to-purple-600/20 blur-3xl" />
        <div className="relative px-8 py-10">
          <h2 className="text-3xl font-bold text-white">Gestión de estudiantes</h2>
          <p className="text-white/70 mt-3 max-w-2xl">
            Supervisa el avance real de tus estudiantes, identifica quién necesita acompañamiento y reconoce los logros alcanzados.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de estudiantes', value: summary.totalStudents, icon: '👥' },
          { label: 'Activos', value: summary.activeStudents, icon: '⚡' },
          { label: 'Inactivos', value: summary.inactiveStudents, icon: '🌙' },
          { label: 'Completaron cursos', value: summary.completedStudents, icon: '🏁' }
        ].map((card) => (
          <div key={card.label} className="rounded-3xl bg-[#0f0824]/80 border border-white/10 p-5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{card.icon}</div>
              <div>
                <p className="text-sm text-white/70">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f0824]/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-white/60">Buscar estudiante</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o correo electrónico"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-pink-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/60">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-300 focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="completed">Completaron</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60">Curso</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-pink-300 focus:outline-none"
            >
              {courseOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'Todos los cursos' : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white/5 border border-white/10 p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{student.name}</p>
                    <p className="text-sm text-white/60">{student.email}</p>
                    <p className="text-xs text-white/50 mt-1">
                      Última actividad: {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('es-MX') : 'Sin registros'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-white/70">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      Cursos: {student.enrolledCourses}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      Progreso promedio: {student.totalProgress}%
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      Horas totales: {student.totalHours}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full border ${
                        student.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                          : student.status === 'active'
                            ? 'bg-sky-500/20 text-sky-200 border-sky-400/30'
                            : 'bg-white/10 text-white/70 border-white/20'
                      }`}
                    >
                      {student.status === 'completed'
                        ? 'Completado'
                        : student.status === 'active'
                          ? 'Activo'
                          : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {student.courses?.length ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {student.courses.map((course) => (
                      <div key={course.id} className="rounded-2xl bg-[#0f0824]/80 border border-white/10 px-4 py-3 text-sm text-white/70">
                        <p className="text-white font-medium">{course.title}</p>
                        <p className="text-xs mt-1">Progreso: {course.progress}%</p>
                        <p className="text-xs text-white/50">{course.completed ? 'Curso completado' : 'En progreso'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/50 mt-3">No hay cursos asociados.</p>
                )}
              </motion.div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center text-white/60">
              <p className="text-lg">No se encontraron estudiantes con los filtros actuales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
