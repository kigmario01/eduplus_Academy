import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return setError('El nombre es obligatorio'), false;
    if (!formData.lastname.trim()) return setError('El apellido es obligatorio'), false;
    if (!selectedRole) return setError('Por favor, selecciona si eres Instructor o Estudiante antes de continuar.'), false;
    if (formData.password !== formData.confirmPassword) return setError('Las contraseñas no coinciden'), false;
    if (formData.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres'), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        role: selectedRole
      };
      await authService.register(userData);
      navigate('/login', { state: { message: 'Registro exitoso. Por favor inicia sesión.' } });
    } catch (err) {
      console.error('Error en el registro:', err);
      setError(err.message || 'Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0121] via-[#1a0333] to-[#0b0121] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 12L12 17L22 12" />
              <path d="M2 17L12 22L22 17" />
            </svg>
          </Link>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600">
            Crea tu cuenta
          </h2>
          <p className="mt-3 text-neutral-300">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-pink-400 hover:text-pink-300 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[#150635]/80 backdrop-blur-md border border-white/10 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 bg-red-950/50 border-l-4 border-red-500 p-4 rounded-md text-red-300">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-200">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 py-3 pl-3 block w-full rounded-lg bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                  placeholder="Juan"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-neutral-200">
                  Apellido
                </label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="mt-1 py-3 pl-3 block w-full rounded-lg bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-200">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 py-3 pl-3 block w-full rounded-lg bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-200">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 py-3 pl-3 block w-full rounded-lg bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-200">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 py-3 pl-3 block w-full rounded-lg bg-[#1e103d]/60 text-white placeholder-gray-400 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Selección de rol */}
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-4">
                ¿Cómo te vas a registrar?
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRole === 'student'
                      ? 'border-pink-500 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white shadow-lg'
                      : 'border-white/10 bg-[#1e103d]/60 hover:border-pink-400 hover:text-white'
                  }`}
                >
                  🎓 Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('instructor')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRole === 'instructor'
                      ? 'border-pink-500 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white shadow-lg'
                      : 'border-white/10 bg-[#1e103d]/60 hover:border-pink-400 hover:text-white'
                  }`}
                >
                  👨‍🏫 Instructor
                </button>
              </div>

              {selectedRole && (
                <p className="mt-3 text-sm text-neutral-300">
                  {selectedRole === 'student'
                    ? '📚 Te registrarás como estudiante y podrás acceder a los cursos disponibles.'
                    : '👨‍🏫 Te registrarás como instructor y podrás crear y administrar tus cursos.'}
                </p>
              )}
            </div>

            {/* Términos */}
            <div className="flex items-center mt-4">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-white/20 rounded bg-[#1e103d]"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-neutral-300">
                Acepto los{' '}
                <a href="#" className="text-pink-400 hover:text-pink-300 transition">
                  términos y condiciones
                </a>
              </label>
            </div>

            {/* Botón */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>

          {/* Divider social */}
          <div className="mt-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#150635] text-neutral-400">O regístrate con</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Google', 'Twitter', 'GitHub'].map((name) => (
                <button
                  key={name}
                  className="w-full py-2 rounded-md border border-white/10 bg-[#1e103d]/60 hover:bg-[#2a1252]/80 text-sm font-medium text-white shadow-md hover:shadow-pink-500/30 transition-all"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
