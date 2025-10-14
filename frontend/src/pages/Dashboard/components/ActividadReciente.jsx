import { motion } from 'framer-motion';
import { BadgeCheck, BellRing, GraduationCap, Sparkles } from 'lucide-react';

const iconByType = {
  achievement: Sparkles,
  enrollment: GraduationCap,
  feedback: BadgeCheck,
  live: BellRing,
};

const toneByType = {
  achievement: 'from-emerald-400/20 via-emerald-400/10 to-transparent text-emerald-200',
  enrollment: 'from-blue-400/20 via-blue-400/10 to-transparent text-blue-200',
  feedback: 'from-violet-400/20 via-violet-400/10 to-transparent text-violet-200',
  live: 'from-amber-400/20 via-amber-400/10 to-transparent text-amber-200',
};

const ActividadReciente = ({ activity }) => {
  if (!activity?.length) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-[#0B1430] p-8 text-center">
        <h2 className="text-lg font-semibold text-white">Sin actividad reciente</h2>
        <p className="text-sm text-gray-400">
          Aquí aparecerán tus inscripciones, logros y novedades más importantes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/5 bg-[#0B1430] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Actividad reciente</h2>
          <p className="text-sm text-gray-400">Mantente al día con tus interacciones más recientes.</p>
        </div>
        <button className="text-sm font-semibold text-blue-300 transition hover:text-blue-200">Ver historial</button>
      </div>

      <div className="mt-6 space-y-5">
        {activity.map((item, index) => {
          const Icon = iconByType[item.type] || Sparkles;
          const tone = toneByType[item.type] || toneByType.achievement;

          return (
            <motion.article
              key={item.id || item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#111C3A] p-5"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${tone}`} aria-hidden="true" />
              <div className="relative z-10 flex gap-4">
                <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 backdrop-blur">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{item.date}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default ActividadReciente;
