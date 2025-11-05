import { useState } from 'react';
import { motion } from 'framer-motion';

const Toggle = ({ enabled, onChange }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.92 }}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
      enabled ? 'bg-gradient-to-r from-emerald-400 to-sky-400' : 'bg-white/20'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </motion.button>
);

const Settings = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklySummary: false,
    autoPlayVideos: true,
    darkMode: typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  });

  const togglePreference = (key, callback) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      callback?.(updated[key]);
      return updated;
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 text-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Configuración</h2>
        <p className="text-sm text-white/60">Personaliza tu experiencia en la plataforma.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <section className="space-y-5 border-b border-white/10 p-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
            <p className="text-sm text-white/60">Controla los correos y recordatorios que recibes.</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-[#0b0522]/60 p-4">
              <div>
                <p className="text-sm font-medium text-white">Correos sobre actividad</p>
                <p className="text-xs text-white/60">Recibe alertas cuando haya novedades en tus cursos.</p>
              </div>
              <Toggle
                enabled={preferences.emailNotifications}
                onChange={() => togglePreference('emailNotifications')}
              />
            </label>

            <label className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-[#0b0522]/60 p-4">
              <div>
                <p className="text-sm font-medium text-white">Resumen semanal</p>
                <p className="text-xs text-white/60">Recibe cada lunes un resumen de tu progreso.</p>
              </div>
              <Toggle enabled={preferences.weeklySummary} onChange={() => togglePreference('weeklySummary')} />
            </label>
          </div>
        </section>

        <section className="space-y-5 p-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Reproducción de contenido</h3>
            <p className="text-sm text-white/60">Ajusta cómo se muestran los videos y materiales.</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-[#0b0522]/60 p-4">
              <div>
                <p className="text-sm font-medium text-white">Autoreproducción de videos</p>
                <p className="text-xs text-white/60">Inicia automáticamente el siguiente video al terminar.</p>
              </div>
              <Toggle enabled={preferences.autoPlayVideos} onChange={() => togglePreference('autoPlayVideos')} />
            </label>

            <label className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-[#0b0522]/60 p-4">
              <div>
                <p className="text-sm font-medium text-white">Modo oscuro</p>
                <p className="text-xs text-white/60">Activa una experiencia más cómoda para tus ojos.</p>
              </div>
              <Toggle
                enabled={preferences.darkMode}
                onChange={() =>
                  togglePreference('darkMode', (enabled) => {
                    if (typeof window !== 'undefined') {
                      document.documentElement.classList.toggle('dark', enabled);
                      localStorage.theme = enabled ? 'dark' : 'light';
                    }
                  })
                }
              />
            </label>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 px-5 py-2 text-sm font-semibold text-[#0b0522] shadow-lg"
        >
          Guardar cambios
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;
