import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar si hay un token en localStorage
  const isLoggedIn = localStorage.getItem('token');
  
  // Efecto para detectar scroll y cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Determinar si estamos en la página de inicio para aplicar estilos diferentes
  const isHomePage = location.pathname === '/';

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link 
              to="/" 
              className={`text-2xl font-bold flex items-center space-x-2 ${
                scrolled || !isHomePage ? 'text-primary-600' : 'text-white'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" fill="currentColor" />
                <path d="M2 12L12 17L22 12" fill="currentColor" />
              </svg>
              <span>EduPlus Academy</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                scrolled || !isHomePage 
                  ? 'text-gray-700 hover:text-primary-600' 
                  : 'text-white hover:text-secondary-300'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/courses" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                scrolled || !isHomePage 
                  ? 'text-gray-700 hover:text-primary-600' 
                  : 'text-white hover:text-secondary-300'
              }`}
            >
              Cursos
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    scrolled || !isHomePage 
                      ? 'text-gray-700 hover:text-primary-600' 
                      : 'text-white hover:text-secondary-300'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:-translate-y-0.5 ${
                    scrolled || !isHomePage 
                      ? 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50' 
                      : 'bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:-translate-y-0.5 ${
                    scrolled || !isHomePage 
                      ? 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50' 
                      : 'bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    scrolled || !isHomePage 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-secondary-600 text-white hover:bg-secondary-700'
                  }`}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors ${
                scrolled || !isHomePage 
                  ? 'text-gray-500 hover:text-gray-600 hover:bg-gray-100' 
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div 
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300 ${
          scrolled || !isHomePage ? 'bg-white' : 'bg-primary-700/95 backdrop-blur-md'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              scrolled || !isHomePage 
                ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            to="/courses"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              scrolled || !isHomePage 
                ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Cursos
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  scrolled || !isHomePage 
                    ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50' 
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  scrolled || !isHomePage 
                    ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  scrolled || !isHomePage 
                    ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50' 
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  scrolled || !isHomePage 
                    ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-50' 
                    : 'text-white hover:bg-white/10'
                }`}
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