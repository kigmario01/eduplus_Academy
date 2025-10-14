import { motion } from 'framer-motion';
import { ChevronRight, PlayCircle } from 'lucide-react';

const courseVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

const CursosEnProgreso = ({ courses }) => {
  if (!courses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-[#0B1430] p-8 text-center">
        <h3 className="text-lg font-semibold text-white">Aún no tienes cursos activos</h3>
        <p className="mt-2 text-sm text-gray-400">
          Explora la biblioteca de EduPlus y comienza tu siguiente reto de aprendizaje.
        </p>
        <button className="mt-6 rounded-full bg-[#1E63F7] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2A72FF]">
          Descubrir cursos
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white/5 bg-[#0B1430] p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Cursos en progreso</h2>
          <p className="text-sm text-gray-400">
            Retoma donde lo dejaste y mantén el ritmo de tus objetivos.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200">
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {courses.map((course, index) => (
          <motion.article
            key={course.id || course._id || course.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={courseVariants}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#111C3A] shadow-lg shadow-black/20"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={course.cover || course.image}
                alt={course.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium text-white">
                {course.category}
              </div>
            </div>
            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                {course.instructor && <p className="text-sm text-gray-400">Con {course.instructor}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Progreso</span>
                  <span className="font-semibold text-blue-300">{Math.round(course.progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#1E63F7] via-[#2F7BFF] to-[#3F8CFF]"
                    style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {course.lessonsCompleted}/{course.lessonsTotal} lecciones
                  </span>
                  {course.nextLesson && <span>Siguiente: {course.nextLesson}</span>}
                </div>
              </div>

              <button className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                <PlayCircle className="h-4 w-4" />
                Continuar
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default CursosEnProgreso;
