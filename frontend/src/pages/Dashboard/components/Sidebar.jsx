import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, LayoutDashboard, LogOut, Menu, Settings, UserRound } from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/courses', label: 'Mis Cursos', icon: BookOpen },
  { path: '/dashboard/profile', label: 'Perfil', icon: UserRound },
  { path: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 264 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="sticky top-0 hidden h-screen flex-col border-r border-white/5 bg-[#0B1220]/95 px-5 pb-8 pt-6 text-sm text-gray-300 backdrop-blur lg:flex"
    >
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.4em] text-blue-300">EduPlus</span>
            <span className="text-lg font-semibold text-white">Academy</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10"
          aria-label="Contraer barra lateral"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path} className="relative">
              <motion.div
                layout
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition ${
                  isActive
                    ? 'bg-[#1E63F7]/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-300' : 'text-gray-500 group-hover:text-blue-200'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </motion.div>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute -left-5 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full bg-[#1E63F7]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {!isCollapsed && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-gray-400">
            <p className="font-semibold text-white">Soporte 24/7</p>
            <p>¿Necesitas ayuda? Estamos aquí para ti.</p>
          </div>
        )}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
