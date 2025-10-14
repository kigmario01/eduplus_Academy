import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, LogOut, MoonStar, SunMedium } from 'lucide-react';

const defaultNotifications = [
  { id: 1, text: 'Nuevo curso agregado: Ciencia de Datos aplicada', time: 'hace 10 min', read: false },
  { id: 2, text: 'Tu certificado de IA ya está disponible', time: 'hace 1 hora', read: false },
  { id: 3, text: 'Tienes comentarios en la evaluación de UX', time: 'ayer', read: true },
];

const Header = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    document.documentElement.classList.toggle('dark', newValue);
    localStorage.theme = newValue ? 'dark' : 'light';
  };

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0B1220]/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="hidden text-sm font-medium text-gray-400 lg:block">
          "Aprender. Crecer. Compartir." – EduPlus Academy
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </motion.button>

          <div className="relative" ref={notificationsRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10"
              aria-label="Abrir notificaciones"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1E63F7] text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-xl shadow-black/30"
                >
                  <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-300">
                    <span className="font-semibold text-white">Notificaciones</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-semibold text-blue-300 transition hover:text-blue-200">
                        Marcar como leídas
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-white/5">
                    {notifications.length ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 text-sm ${notification.read ? 'text-gray-400' : 'bg-white/5 text-white'}`}
                        >
                          <p>{notification.text}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">No hay notificaciones pendientes.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-white/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1E63F7] to-[#2A72FF] text-sm font-semibold text-white">
                {user?.name?.[0] ?? 'E'}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="font-semibold text-white">{user?.name ?? 'Usuario'}</p>
                <p className="text-xs text-gray-400">{user?.role ?? 'Miembro'}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition ${isProfileOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] text-sm text-gray-300 shadow-xl shadow-black/30"
                >
                  <a href="/dashboard/profile" className="block px-4 py-3 transition hover:bg-white/5">
                    Ver perfil
                  </a>
                  <a href="/dashboard/settings" className="block px-4 py-3 transition hover:bg-white/5">
                    Configuración
                  </a>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
