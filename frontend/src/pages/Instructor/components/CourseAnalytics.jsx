import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Clock,
  Star,
  BookOpen
} from 'lucide-react';

const CourseAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Llamada real a la API del backend
      const response = await fetch('http://localhost:5000/api/instructor/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transformar los datos del backend al formato esperado por el componente
        const transformedData = {
          overview: [
            {
              title: 'Ingresos Totales',
              value: `$${result.data.totalRevenue?.toLocaleString() || '0'}`,
              change: 15.3, // Este valor podría venir del backend en el futuro
              icon: DollarSign,
              bgColor: 'bg-green-100',
              iconColor: 'text-green-600'
            },
            {
              title: 'Estudiantes Activos',
              value: result.data.totalStudents?.toLocaleString() || '0',
              change: 8.2,
              icon: Users,
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600'
            },
            {
              title: 'Calificación Promedio',
              value: result.data.averageRating?.toFixed(1) || '0.0',
              change: 2.1,
              icon: Star,
              bgColor: 'bg-yellow-100',
              iconColor: 'text-yellow-600'
            },
            {
              title: 'Tasa de Finalización',
              value: `${result.data.completionRate || 0}%`,
              change: 12.5,
              icon: TrendingUp,
              bgColor: 'bg-purple-100',
              iconColor: 'text-purple-600'
            }
          ],
          revenueChart: result.data.monthlyStats || [],
          topCourses: result.data.topCourses || [],
          engagement: [
            { metric: 'Tasa de Finalización', value: result.data.completionRate || 0 },
            { metric: 'Tiempo en Plataforma', value: 65 },
            { metric: 'Interacción con Contenido', value: 82 },
            { metric: 'Participación en Foros', value: 45 }
          ],
          recentActivity: [
            {
              description: 'Datos actualizados desde el servidor',
              time: 'ahora',
              icon: TrendingUp,
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600'
            }
          ],
          timeMetrics: [
            {
              value: '24.5h',
              label: 'Tiempo promedio por curso',
              icon: Clock,
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600'
            },
            {
              value: `${result.data.completionRate || 0}%`,
              label: 'Tasa de retención',
              icon: TrendingUp,
              bgColor: 'bg-green-100',
              iconColor: 'text-green-600'
            }
          ]
        };
        
        setAnalytics(transformedData);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // En caso de error, mostrar datos por defecto
      setAnalytics({
        overview: [
          {
            title: 'Ingresos Totales',
            value: '$0',
            change: 0,
            icon: DollarSign,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600'
          },
          {
            title: 'Estudiantes Activos',
            value: '0',
            change: 0,
            icon: Users,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600'
          },
          {
            title: 'Calificación Promedio',
            value: '0.0',
            change: 0,
            icon: Star,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600'
          },
          {
            title: 'Tasa de Finalización',
            value: '0%',
            change: 0,
            icon: TrendingUp,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600'
          }
        ],
        revenueChart: [],
        topCourses: [],
        engagement: [],
        recentActivity: [
          {
            description: 'Error al cargar datos del servidor',
            time: 'ahora',
            icon: Users,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600'
          }
        ],
        timeMetrics: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analíticas de Cursos</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Monitorea el rendimiento de tus cursos y el engagement de los estudiantes
            </p>
            <div className="flex space-x-2">
              {[
                { value: '7d', label: '7 días' },
                { value: '30d', label: '30 días' },
                { value: '90d', label: '90 días' },
                { value: '1y', label: '1 año' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analytics.overview.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`h-4 w-4 mr-1 ${
                      metric.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`text-sm ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de ingresos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por Mes</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.revenueChart.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(item.value / Math.max(...analytics.revenueChart.map(i => i.value))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                  <span className="text-xs font-medium text-gray-900">${item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cursos más populares */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cursos Más Populares</h3>
            <div className="space-y-4">
              {analytics.topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-600">{course.students} estudiantes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${course.revenue}</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{course.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Engagement de estudiantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement de Estudiantes</h3>
            <div className="space-y-4">
              {analytics.engagement.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                    <span className="text-sm text-gray-900">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actividad reciente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${activity.bgColor}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Métricas de tiempo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Tiempo</h3>
            <div className="space-y-6">
              {analytics.timeMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${metric.bgColor} mb-2`}>
                    <metric.icon className={`h-8 w-8 ${metric.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Estado inicial para datos de analytics
const initialAnalyticsData = {
  overview: [
    {
      title: 'Ingresos Totales',
      value: '$0',
      change: 0,
      icon: DollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Estudiantes Activos',
      value: '0',
      change: 0,
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Visualizaciones',
      value: '0',
      change: 0,
      icon: Eye,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Tiempo Promedio',
      value: '0h',
      change: 0,
      icon: Clock,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ],
  revenueChart: [],
  topCourses: [],
  engagement: [
    { metric: 'Tasa de Finalización', value: 0 },
    { metric: 'Tiempo en Plataforma', value: 0 },
    { metric: 'Interacción con Contenido', value: 0 },
    { metric: 'Participación en Foros', value: 0 }
  ],
  recentActivity: [
    {
      description: 'Nuevo estudiante se inscribió en React Avanzado',
      time: 'hace 5 minutos',
      icon: Users,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      description: 'Curso de JavaScript alcanzó 300 estudiantes',
      time: 'hace 1 hora',
      icon: TrendingUp,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      description: 'Nueva reseña 5 estrellas en TypeScript',
      time: 'hace 2 horas',
      icon: Star,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      description: 'Actualización de contenido completada',
      time: 'hace 3 horas',
      icon: BookOpen,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ],
  timeMetrics: [
    {
      value: '24.5h',
      label: 'Tiempo promedio por curso',
      icon: Clock,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      value: '89%',
      label: 'Tasa de retención',
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]
};

export default CourseAnalytics;