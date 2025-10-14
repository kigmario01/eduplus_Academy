import { motion } from 'framer-motion';
import { Calendar, Layers, Sparkles } from 'lucide-react';

const variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

const formatDate = (value) => {
  if (!value) return null;
  try {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch (error) {
    return value;
  }
};

const CursosDisponibles = ({ courses = [] }) => {
  if (!courses.length) {
    return (
      <section className="rounded-3xl border border-dashed border-white/10 bg-[#0B1430] p-8 text-center">
        <h2 className="text-lg font-semibold text-white">Sin cursos disponibles por ahora</h2>
        <p className="mt-2 text-sm text-gray-400">
          Cuando se publiquen nuevos programas, los verás aquí de inmediato.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/5 bg-[#0B1430] p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Cursos disponibles</h2>
          <p className="text-sm text-gray-400">
            Selecciona el siguiente reto y continúa ampliando tu experiencia.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-blue-400/60 hover:text-blue-200">
          <Sparkles className="h-4 w-4" />
          Ver catálogo
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {courses.map((course, index) => (
          <motion.article
            key={course.id || course.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={variants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#111C3A] p-6 shadow-lg shadow-black/20"
          >
            {course.cover && (
              <div className="mb-5 overflow-hidden rounded-2xl">
                <img
                  src={course.cover}
                  alt={course.title}
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-blue-200">
                  {course.category}
                </span>
                {course.level && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
                    {course.level}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                {course.description && <p className="text-sm text-gray-400">{course.description}</p>}
              </div>

              <div className="grid gap-3 text-xs text-gray-400 sm:grid-cols-2">
                {course.startDate && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <Calendar className="h-4 w-4 text-blue-300" />
                    <span>Comienza {formatDate(course.startDate)}</span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <Layers className="h-4 w-4 text-blue-300" />
                    <span>Duración {course.duration}</span>
                  </div>
                )}
              </div>

              <button className="inline-flex items-center justify-center rounded-full bg-[#1E63F7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2A72FF]">
                Postularme
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default CursosDisponibles;
