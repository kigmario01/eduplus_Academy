import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Sparkles } from 'lucide-react';

const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
};

const formatTime = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const DashboardHeader = ({ userName = 'Estudiante', userRole = 'Aprendiz', onRefresh, summary }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#111C3A] via-[#0B1430] to-[#050B1B] p-6 sm:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,99,247,0.28),_transparent_60%)]" aria-hidden="true" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-300">
            <Sparkles className="mr-2 h-4 w-4" />
            Panel principal
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {greeting()}, {userName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-gray-400 sm:text-base">
              Este es un resumen actualizado de tu progreso, actividad reciente y próximos pasos en EduPlus.
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-gray-300">
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur">
            <CalendarDays className="h-5 w-5 text-blue-300" />
            <div>
              <p className="text-xs text-gray-400">Hoy es</p>
              <p className="font-medium capitalize">{formatDate(now)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur">
            <Clock className="h-5 w-5 text-blue-300" />
            <div>
              <p className="text-xs text-gray-400">Hora local</p>
              <p className="font-medium">{formatTime(now)} hrs</p>
            </div>
          </div>
          {summary?.nextMilestone && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur">
              <Sparkles className="h-5 w-5 text-blue-300" />
              <div>
                <p className="text-xs text-gray-400">Próximo objetivo</p>
                <p className="font-medium text-white/90">{summary.nextMilestone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-widest text-gray-500">{userRole}</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="rounded-full bg-[#1E63F7] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2A72FF]"
              >
                Actualizar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
