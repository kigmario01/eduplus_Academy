import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import CursosEnProgreso from './components/CursosEnProgreso';
import ActividadReciente from './components/ActividadReciente';
import ErrorBanner from './components/ErrorBanner';
import Loader from './components/Loader';
import getDashboardOverview from '../../services/dashboardService';
import CursosDisponibles from './components/CursosDisponibles';
import NoticiasDestacadas from './components/NoticiasDestacadas';

const Dashboard = () => {
  const [data, setData] = useState({
    stats: [],
    coursesInProgress: [],
    availableCourses: [],
    activity: [],
    news: [],
    user: null,
    summary: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDashboardOverview();
      setData({
        stats: response?.stats ?? [],
        coursesInProgress: response?.coursesInProgress ?? [],
        availableCourses: response?.availableCourses ?? [],
        activity: response?.activity ?? [],
        news: response?.news ?? [],
        user: response?.user ?? null,
        summary: response?.summary ?? null,
      });
      setError(null);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userName = useMemo(() => {
    if (data.user?.name) return data.user.name;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!stored) return 'Estudiante';
    try {
      return JSON.parse(stored)?.name ?? 'Estudiante';
    } catch (error) {
      return 'Estudiante';
    }
  }, [data.user]);

  const userRole = data.user?.role ?? 'Miembro de EduPlus';

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            <DashboardHeader userName={userName} userRole={userRole} onRefresh={loadData} summary={data.summary} />
            <ErrorBanner message={error} onRetry={loadData} />
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="flex flex-col gap-8"
                >
                  <StatsCards stats={data.stats} />
                  <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="flex flex-col gap-8">
                      <CursosEnProgreso courses={data.coursesInProgress} />
                      <CursosDisponibles courses={data.availableCourses} />
                    </div>
                    <div className="flex flex-col gap-8">
                      <ActividadReciente activity={data.activity} />
                      <NoticiasDestacadas news={data.news} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
