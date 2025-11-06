import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ userRole = 'student' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-[#0b0121]/95 backdrop-blur-lg border-b border-white/10 shadow-lg py-2'
          : 'bg-gradient-to-r from-[#0b0121]/95 via-[#1a0333]/95 to-[#0b0121]/95 backdrop-blur-lg py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold flex items-center space-x-2 text-white"
            >
              <svg
                className="w-8 h-8 text-pink-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
                EduPlus Academy
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-neutral-200 hover:text-white transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/courses"
              className="px-3 py-2 rounded-md text-sm font-medium text-neutral-200 hover:text-white transition-colors"
            >
              Cursos
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-neutral-200 hover:text-pink-400 transition-colors"
                >
                  Dashboard
                </Link>

                {userRole === 'student' && (
                  <Link
                    to="/certificates"
                    className="px-3 py-2 rounded-md text-sm font-medium text-neutral-200 hover:text-white transition-colors"
                  >
                    Mis certificados
                  </Link>
                )}

                {(userRole === 'instructor' || userRole === 'admin') && (
                  <Link
                    to="/instructor"
                    className="px-3 py-2 rounded-md text-sm font-medium text-fuchsia-400 hover:text-pink-400 transition-colors"
                  >
                    Panel Instructor
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-transparent border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium border border-pink-500 text-pink-400 hover:bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-pink-500/30"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white hover:from-pink-500 hover:to-fuchsia-600 shadow-md hover:shadow-pink-500/40 transition-all duration-300"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-white hover:bg-white/10 transition"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#0b0121]/95 backdrop-blur-lg border-t border-white/10`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-neutral-200">
          <Link to="/" className="block px-3 py-2 rounded-md hover:text-white" onClick={() => setIsMenuOpen(false)}>
            Inicio
          </Link>
          <Link to="/courses" className="block px-3 py-2 rounded-md hover:text-white" onClick={() => setIsMenuOpen(false)}>
            Cursos
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              {userRole === 'student' && (
                <Link to="/certificates" className="block px-3 py-2 rounded-md hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Mis certificados
                </Link>
              )}
              {(userRole === 'instructor' || userRole === 'admin') && (
                <Link to="/instructor" className="block px-3 py-2 rounded-md text-fuchsia-400 hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>
                  Panel Instructor
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md hover:text-white"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md border border-pink-500 text-pink-400 hover:bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 hover:text-white transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white hover:from-pink-500 hover:to-fuchsia-600 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
