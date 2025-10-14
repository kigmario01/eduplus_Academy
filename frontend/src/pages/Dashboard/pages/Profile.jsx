import { useMemo } from 'react';
import { motion } from 'framer-motion';

const Profile = ({ user }) => {
  const profile = useMemo(() => {
    if (user && Object.keys(user).length > 0) {
      return user;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : {};
      } catch (error) {
        console.warn('No se pudo leer el usuario de localStorage', error);
      }
    }

    return {};
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Perfil</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visualiza y actualiza la información básica de tu cuenta.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt={profile?.name} className="h-full w-full object-cover" />
            ) : (
              profile?.name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{profile?.name || 'Usuario sin nombre'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email || 'correo@ejemplo.com'}</p>
            <span className="inline-flex items-center px-2 py-1 mt-2 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              {profile?.role || 'Estudiante'}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Biografía</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {profile?.bio || 'Comparte una breve descripción sobre ti para que tus instructores te conozcan mejor.'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Intereses</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {profile?.interests?.join(', ') || 'Añade tus áreas de interés para recibir recomendaciones personalizadas.'}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Seguridad</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Contraseña</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Última actualización hace 90 días</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
              >
                Cambiar contraseña
              </motion.button>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Verificación en dos pasos</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Protege tu cuenta con un segundo factor</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-blue-200 text-blue-600 dark:border-blue-700 dark:text-blue-300"
              >
                Configurar 2FA
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
