import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ user: providedUser, onLogout }) => {
  const [user, setUser] = useState(providedUser ?? null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    if (providedUser) {
      setUser(providedUser);
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.warn('No se pudo obtener el usuario almacenado', error);
    }
  }, [providedUser]);

  useEffect(() => {
    const shouldEnableDark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDarkMode(shouldEnableDark);
    document.documentElement.classList.toggle('dark', shouldEnableDark);

    setNotifications([
      { id: 1, text: 'Nuevo curso disponible: React Avanzado', time: '10 min', read: false },
      { id: 2, text: 'Tu certificado está listo para descargar', time: '1 hora', read: false },
      { id: 3, text: 'Recordatorio: Clase en vivo mañana', time: '3 horas', read: true }
    ]);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    const nextDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', nextDarkMode);
    localStorage.theme = nextDarkMode ? 'dark' : 'light';
    setIsDarkMode(nextDarkMode);
  };

  const markAllAsRead = () => {
    setNotifications((prevNotifications) => prevNotifications.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayName = useMemo(() => {
    if (!user) return 'Estudiante';
    return (
      user.full_name ||
      user.name ||
      `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
      user.email ||
      'Estudiante'
    );
  }, [user]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08021f]/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Dashboard</p>
              <p className="mt-1 text-sm font-semibold text-white">Bienvenido, {displayName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Botón de modo oscuro */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="rounded-xl p-2 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </motion.button>

            {/* Notificaciones */}
            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative rounded-xl p-2 text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-semibold text-white shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl border border-white/10 bg-[#0b0620]/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="divide-y divide-white/10">
                      <div className="flex items-center justify-between px-4 py-2">
                        <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-emerald-300 transition-colors duration-200 hover:text-emerald-100"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 text-sm text-white/80 transition-colors duration-200 ${
                                !notification.read ? 'bg-white/5' : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex justify-between">
                                <p>{notification.text}</p>
                                {!notification.read && <span className="h-2 w-2 rounded-full bg-emerald-400"></span>}
                              </div>
                              <p className="mt-1 text-xs text-white/40">Hace {notification.time}</p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-white/60">No hay notificaciones</div>
                        )}
                      </div>
                      <div className="px-4 py-2">
                        <button className="w-full text-center text-xs font-medium text-white/60 transition-colors duration-200 hover:text-white">
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Perfil de usuario */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-sm font-medium text-white">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    displayName.charAt(0)
                  )}
                </div>
                <span className="hidden text-sm font-medium text-white/80 sm:block">{displayName}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-white/60 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-white/10 bg-[#0b0620]/95 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="py-2">
                      <a
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                      >
                        Mi Perfil
                      </a>
                      <a
                        href="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                      >
                        Configuración
                      </a>
                      <button
                        onClick={onLogout}
                        className="block w-full px-4 py-2 text-left text-sm font-medium text-rose-300 transition-colors duration-200 hover:bg-rose-500/10 hover:text-white"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
