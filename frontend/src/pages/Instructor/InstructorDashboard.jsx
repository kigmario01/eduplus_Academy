import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/api';
import CourseList from './components/CourseList';
import CourseEditor from './components/CourseEditor';
import CourseAnalytics from './components/CourseAnalytics';
import StudentManagement from './components/StudentManagement';

const InstructorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [instructor, setInstructor] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
    pendingReviews: 0,
    newEnrollments: 0
  });

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    setActiveTab(path === 'instructor' ? 'overview' : path);
    
    // Obtener información del instructor
    const user = authService.getCurrentUser();
    setInstructor(user);
    
    // Cargar estadísticas reales del instructor
    loadInstructorStats();
  }, [location]);

  const loadInstructorStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/instructor/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading instructor stats:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: '📊', path: '/instructor' },
    { id: 'courses', name: 'Mis Cursos', icon: '📚', path: '/instructor/courses' },
    { id: 'create', name: 'Crear Curso', icon: '➕', path: '/instructor/create' },
    { id: 'analytics', name: 'Analíticas', icon: '📈', path: '/instructor/analytics' },
    { id: 'students', name: 'Estudiantes', icon: '👥', path: '/instructor/students' },
  ];

  const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${color} rounded-xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className="text-white/90 text-xs mt-2 flex items-center">
              <span className="mr-1">↗️</span>
              +{trend}% este mes
            </p>
          )}
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </motion.div>
  );

  const OverviewContent = () => (
    <div className="space-y-8">
      {/* Bienvenida personalizada */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          ¡Bienvenido de vuelta, {instructor?.name}! 👋
        </h2>
        <p className="text-purple-100 text-lg">
          Aquí tienes un resumen de tu actividad como instructor
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Cursos Activos"
          value={stats.totalCourses}
          icon="📚"
          color="from-blue-500 to-blue-600"
          trend="8"
        />
        <StatCard
          title="Estudiantes Totales"
          value={stats.totalStudents.toLocaleString()}
          icon="👥"
          color="from-green-500 to-green-600"
          trend="12"
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💰"
          color="from-yellow-500 to-orange-500"
          trend="15"
        />
        <StatCard
          title="Calificación Promedio"
          value={stats.avgRating}
          icon="⭐"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Nuevas Inscripciones"
          value={stats.newEnrollments}
          icon="🎯"
          color="from-indigo-500 to-indigo-600"
          trend="23"
        />
        <StatCard
          title="Reseñas Pendientes"
          value={stats.pendingReviews}
          icon="📝"
          color="from-red-500 to-red-600"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/instructor/create"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mr-3">➕</span>
            <div>
              <p className="font-semibold text-blue-900">Crear Curso</p>
              <p className="text-blue-600 text-sm">Nuevo contenido</p>
            </div>
          </Link>
          <Link
            to="/instructor/analytics"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl mr-3">📈</span>
            <div>
              <p className="font-semibold text-green-900">Ver Analíticas</p>
              <p className="text-green-600 text-sm">Rendimiento</p>
            </div>
          </Link>
          <Link
            to="/instructor/students"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-2xl mr-3">👥</span>
            <div>
              <p className="font-semibold text-purple-900">Gestionar Estudiantes</p>
              <p className="text-purple-600 text-sm">Comunicación</p>
            </div>
          </Link>
          <Link
            to="/instructor/courses"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <span className="text-2xl mr-3">📚</span>
            <div>
              <p className="font-semibold text-orange-900">Mis Cursos</p>
              <p className="text-orange-600 text-sm">Administrar</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {[
            { action: 'Nueva inscripción en "React Avanzado"', time: 'Hace 2 horas', icon: '🎯' },
            { action: 'Reseña de 5 estrellas recibida', time: 'Hace 4 horas', icon: '⭐' },
            { action: 'Curso "JavaScript Moderno" actualizado', time: 'Hace 1 día', icon: '📚' },
            { action: 'Mensaje de estudiante recibido', time: 'Hace 2 días', icon: '💬' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-xl mr-3">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{activity.action}</p>
                <p className="text-gray-500 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header específico para instructores */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg mr-4">
                <span className="text-xl">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Instructor</h1>
                <p className="text-gray-600">Gestiona tu contenido educativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Conectado como</p>
                <p className="font-semibold text-gray-900">{instructor?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation específica para instructores */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<OverviewContent />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="create" element={<CourseEditor />} />
          <Route path="edit/:id" element={<CourseEditor />} />
          <Route path="analytics" element={<CourseAnalytics />} />
          <Route path="students" element={<StudentManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default InstructorDashboard;