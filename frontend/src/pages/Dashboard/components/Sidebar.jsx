import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Iconos
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
  </svg>
);

const CoursesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v6a1 1 0 102 0V6zm-8 2a1 1 0 00-1 1v2a1 1 0 001 1h3a1 1 0 100-2H7V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/dashboard/courses', name: 'Mis Cursos', icon: <CoursesIcon /> },
  { path: '/dashboard/profile', name: 'Perfil', icon: <ProfileIcon /> },
  { path: '/dashboard/settings', name: 'Configuración', icon: <SettingsIcon /> },
];

const Sidebar = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const displayName = useMemo(() => {
    if (!user) return 'Estudiante';
    return user.full_name || user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email || 'Estudiante';
  }, [user]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const variants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };

  return (
    <motion.div
      className="relative h-screen bg-[#0f0824]/95 text-white shadow-[0_20px_45px_-25px_rgba(124,58,237,0.45)] border-r border-white/10 backdrop-blur-xl"
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={variants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_55%)]" />

      <div className="relative p-5 flex justify-between items-center border-b border-white/10">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white"
          >
            EduPlus
          </motion.div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {isCollapsed ? (
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="relative mx-4 mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Mi espacio</p>
          <p className="text-sm font-semibold text-white mt-2 line-clamp-2">{displayName}</p>
        </div>
      )}

      <nav className="relative mt-8">
        <ul>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <li key={item.path} className="px-4 py-2">
                <Link
                  to={item.path}
                  className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 backdrop-blur-sm ${
                    isActive
                      ? 'bg-white/15 text-white shadow-[0_15px_30px_-20px_rgba(124,58,237,0.8)]'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{item.icon}</div>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {isActive && <span className="absolute inset-0 rounded-2xl border border-white/20" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 w-full px-4">
        <button
          className="group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-rose-300 transition-all duration-300 hover:bg-rose-500/10 hover:text-white"
          onClick={onLogout}
        >
          <div className="transition-transform duration-300 group-hover:scale-110">
            <LogoutIcon />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-medium"
            >
              Cerrar Sesión
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;