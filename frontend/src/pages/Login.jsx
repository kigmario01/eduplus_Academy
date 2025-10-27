import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedRole) {
      setError('Por favor, selecciona si eres Instructor o Estudiante antes de continuar.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(formData);
      const userRole = response.user?.role;

      if (selectedRole === 'instructor' && userRole !== 'instructor') {
        setError('❌ Acceso denegado: Tu cuenta no tiene permisos de instructor.');
        setLoading(false);
        return;
      }

      if (selectedRole === 'student' && userRole === 'instructor') {
        setError('❌ Acceso denegado: Tu cuenta es de instructor. Selecciona "Instructor".');
        setLoading(false);
        return;
      }

      if (userRole === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0121] via-[#1a0333] to-[#0b0121] pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-pink-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" fill="currentColor" />
              <path d="M2 12L12 17L22 12" fill="currentColor" />
            </svg>
          </Link>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600">
            Iniciar sesión
          </h2>
          <p className="mt-3 text-neutral-300">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-pink-400 hover:text-pink-300 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-green-950/50 border-l-4 border-green-400 p-4 rounded-md text-green-200">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-950/50 border-l-4 border-red-500 p-4 rounded-md text-red-300">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-[#150635]/80 backdrop-blur-md shadow-2xl rounded-2xl py-8 px-6 sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Selección de Rol */}
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-3">
                ¿Cómo deseas acceder?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`relative flex items-center justify-center px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedRole === 'student'
                      ? 'border-pink-500 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white shadow-lg'
                      : 'border-white/10 bg-[#1e103d]/60 text-neutral-300 hover:border-pink-400 hover:text-white'
                  }`}
                >
                  🎓 Estudiante
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('instructor')}
                  className={`relative flex items-center justify-center px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedRole === 'instructor'
                      ? 'border-pink-500 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white shadow-lg'
                      : 'border-white/10 bg-[#1e103d]/60 text-neutral-300 hover:border-pink-400 hover:text-white'
                  }`}
                >
                  👨‍🏫 Instructor
                </button>
              </div>

              {selectedRole && (
                <p className="mt-2 text-xs text-neutral-400">
                  {selectedRole === 'student'
                    ? '📚 Accederás como estudiante para ver cursos y progreso.'
                    : '👨‍🏫 Accederás como instructor para gestionar cursos y estudiantes.'}
                </p>
              )}
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-200">
                Correo electrónico
              </label>
              <div className="mt-1 relative rounded-md">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="py-3 pl-3 block w-full rounded-lg bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-200">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="py-3 pl-3 block w-full rounded-lg bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Recordarme + olvidar */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-neutral-300">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-white/10 rounded bg-[#1e103d]"
                />
                <span className="ml-2">Recordarme</span>
              </label>

              <Link
                to="#"
                className="font-medium text-pink-400 hover:text-pink-300 transition-colors text-sm"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón principal */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-pink-700 shadow-lg hover:shadow-pink-500/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#150635] text-neutral-400">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Botones sociales */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-white/10 rounded-md shadow-md bg-[#1e103d]/60 text-sm font-medium text-white hover:bg-[#2a1252]/80 hover:shadow-pink-500/30 transition-all duration-300">
                Google
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-white/10 rounded-md shadow-md bg-[#1e103d]/60 text-sm font-medium text-white hover:bg-[#2a1252]/80 hover:shadow-pink-500/30 transition-all duration-300">
                Twitter
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-white/10 rounded-md shadow-md bg-[#1e103d]/60 text-sm font-medium text-white hover:bg-[#2a1252]/80 hover:shadow-pink-500/30 transition-all duration-300">
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
