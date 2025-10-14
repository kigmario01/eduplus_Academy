import { motion } from 'framer-motion';
import { Award, BookOpen, Hourglass, TrendingUp } from 'lucide-react';

const toneClasses = {
  blue: {
    background: 'from-blue-500/20 via-blue-500/5 to-transparent',
    ring: 'ring-blue-500/40',
    icon: 'text-blue-300',
  },
  violet: {
    background: 'from-violet-500/20 via-violet-500/5 to-transparent',
    ring: 'ring-violet-500/40',
    icon: 'text-violet-300',
  },
  emerald: {
    background: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    ring: 'ring-emerald-500/40',
    icon: 'text-emerald-300',
  },
  amber: {
    background: 'from-amber-500/20 via-amber-500/5 to-transparent',
    ring: 'ring-amber-500/40',
    icon: 'text-amber-300',
  },
};

const iconMap = {
  progress: TrendingUp,
  courses: BookOpen,
  achievements: Award,
  hours: Hourglass,
};

const StatsCards = ({ stats }) => {
  if (!stats?.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-[#0B1430] p-8 text-center">
        <h3 className="text-lg font-semibold text-white">Sin estadísticas disponibles</h3>
        <p className="mt-2 text-sm text-gray-400">
          Una vez que avances en tus cursos, verás tus métricas más importantes aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = iconMap[item.id] || TrendingUp;
        const tone = toneClasses[item.tone] || toneClasses.blue;
        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className={`relative overflow-hidden rounded-2xl border border-white/5 bg-[#111C3A] p-6 ring-1 ${tone.ring}`}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.background}`}
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{item.title}</p>
                  <p className="text-3xl font-semibold text-white">{item.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 backdrop-blur ${tone.icon}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-gray-400">{item.caption}</p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};

export default StatsCards;
