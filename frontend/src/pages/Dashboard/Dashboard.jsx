import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { fetchDashboardOverview } from '@/services/dashboardService';
import { authService } from '@/services/api';

const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('No se pudo leer el usuario almacenado', error);
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(getStoredUser);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardOverview();

      setSummary(data.summary || {});
      setCourses(Array.isArray(data.courses) ? data.courses : []);
      setActivities(Array.isArray(data.activities) ? data.activities : []);
      setUser((prevUser) => data.user || prevUser || getStoredUser());
      setError(data.error || null);
      setHasData(Boolean(data.hasData));
    } catch (dashboardError) {
      console.error('No se pudieron cargar los datos del dashboard', dashboardError);
      setError(dashboardError.message || 'No se pudieron cargar los datos');
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="relative min-h-screen bg-[#08021f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/15 via-sky-500/10 to-emerald-500/15 blur-3xl" />

      <div className="relative flex min-h-screen">
        <Sidebar user={user} onLogout={handleLogout} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} onLogout={handleLogout} />

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
            <Routes>
              <Route
                index
                element={
                  <DashboardOverview
                    user={user}
                    summary={summary}
                    courses={courses}
                    activities={activities}
                    isLoading={isLoading}
                    error={error}
                    onRetry={loadDashboard}
                    hasData={hasData}
                  />
                }
              />
              <Route
                path="courses"
                element={
                  <MyCourses
                    courses={courses}
                    isLoading={isLoading}
                    error={error}
                    onRetry={loadDashboard}
                  />
                }
              />
            <Route path="profile" element={<Profile user={user} />} />
            <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
