import { useState } from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklySummary: false,
    autoPlayVideos: true,
    darkMode: typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  });

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personaliza tu experiencia en la plataforma.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
        <section className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notificaciones</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Controla los correos y recordatorios que recibes.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Correos sobre actividad</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recibe alertas cuando haya novedades en tus cursos.</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => togglePreference('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Resumen semanal</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Recibe cada lunes un resumen de tu progreso.</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => togglePreference('weeklySummary')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  preferences.weeklySummary ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    preferences.weeklySummary ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </label>
          </div>
        </section>

        <section className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Reproducción de contenido</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ajusta cómo se muestran los videos y materiales.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Autoreproducción de videos</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Inicia automáticamente el siguiente video al terminar.</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => togglePreference('autoPlayVideos')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  preferences.autoPlayVideos ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    preferences.autoPlayVideos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Modo oscuro</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Activa una experiencia más cómoda para tus ojos.</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  togglePreference('darkMode');
                  if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark');
                    localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  preferences.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </label>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          Guardar cambios
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;
