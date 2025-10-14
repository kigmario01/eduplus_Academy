import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProfile } from '../../services/dashboardService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        setError('Error al cargar el perfil');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0F172A] text-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0F172A] text-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
              <p className="text-red-300">{error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Información Personal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                <p className="text-white">{profile?.user?.name || 'No disponible'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Apellido</label>
                <p className="text-white">{profile?.user?.lastname || 'No disponible'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <p className="text-white">{profile?.user?.email || 'No disponible'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rol</label>
                <p className="text-white capitalize">{profile?.user?.role || 'No disponible'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Miembro desde</label>
                <p className="text-white">
                  {profile?.user?.created_at 
                    ? new Date(profile.user.created_at).toLocaleDateString('es-ES')
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas de Aprendizaje */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Estadísticas</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {profile?.stats?.completed_courses || 0}
                </div>
                <div className="text-sm text-gray-400">Cursos Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {profile?.stats?.enrolled_courses || 0}
                </div>
                <div className="text-sm text-gray-400">Cursos Inscritos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {profile?.stats?.total_study_time || 0}h
                </div>
                <div className="text-sm text-gray-400">Horas de Estudio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {profile?.stats?.total_activities || 0}
                </div>
                <div className="text-sm text-gray-400">Actividades Totales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progreso Reciente */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">Progreso Reciente</h2>
          <div className="space-y-3">
            {profile?.recentProgress?.length > 0 ? (
              profile.recentProgress.map((progress, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{progress.lesson_title}</p>
                    <p className="text-sm text-gray-400">{progress.course_title}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(progress.completed_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay progreso reciente disponible</p>
            )}
          </div>
        </div>
      </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Profile;