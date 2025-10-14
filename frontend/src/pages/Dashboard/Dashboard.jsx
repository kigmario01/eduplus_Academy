import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { fetchDashboardOverview } from '../../services/dashboardService';

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
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(getStoredUser);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardOverview();

      setSummary(data.summary || {});
      setCourses(Array.isArray(data.courses) ? data.courses : []);
      setActivities(Array.isArray(data.activities) ? data.activities : []);
      setUser((prevUser) => data.user || prevUser || getStoredUser());
      setError(data.error || null);
      setIsMock(Boolean(data.isMock));
    } catch (dashboardError) {
      console.error('No se pudieron cargar los datos del dashboard', dashboardError);
      setError(dashboardError.message || 'No se pudieron cargar los datos');
      setIsMock(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
                  isMock={isMock}
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
  );
};

export default Dashboard;
