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
    <div className="mx-auto flex max-w-5xl flex-col gap-6 text-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Perfil</h2>
        <p className="text-sm text-white/60">Visualiza y actualiza la información básica de tu cuenta.</p>
      </div>

      <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-3xl font-semibold">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt={profile?.name} className="h-full w-full object-cover" />
            ) : (
              profile?.name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{profile?.name || 'Usuario sin nombre'}</h3>
            <p className="text-sm text-white/60">{profile?.email || 'correo@ejemplo.com'}</p>
            <span className="mt-3 inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/70">
              {profile?.role || 'Estudiante'}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Biografía</p>
            <p className="mt-3 text-sm text-white/70">
              {profile?.bio || 'Comparte una breve descripción sobre ti para que tus instructores te conozcan mejor.'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Intereses</p>
            <p className="mt-3 text-sm text-white/70">
              {profile?.interests?.join(', ') || 'Añade tus áreas de interés para recibir recomendaciones personalizadas.'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Seguridad</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0b0522]/80 p-5">
              <p className="text-sm font-medium text-white">Contraseña</p>
              <p className="text-xs text-white/50">Última actualización hace 90 días</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Cambiar contraseña
              </motion.button>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0b0522]/80 p-5">
              <p className="text-sm font-medium text-white">Verificación en dos pasos</p>
              <p className="text-xs text-white/50">Protege tu cuenta con un segundo factor</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-emerald-400/60 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 hover:text-white"
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
