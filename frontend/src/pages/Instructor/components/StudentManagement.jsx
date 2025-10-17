import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Cargar estudiantes desde el backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // Llamada real a la API del backend
        const response = await fetch('http://localhost:5000/api/instructor/students', {
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
          const transformedStudents = result.data.map((student, index) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            course: `Curso ${student.enrolledCourses}`, // Adaptado según los datos disponibles
            progress: student.totalProgress || 0,
            lastActivity: student.lastActivity,
            status: student.totalProgress >= 90 ? 'completed' : 
                   student.totalProgress >= 50 ? 'active' : 'inactive',
            avatar: ['👩‍💻', '👨‍💼', '👩‍🎓', '👨‍🔬', '👩‍🏫', '👨‍🎨', '👩‍🚀'][index % 7]
          }));
          
          setStudents(transformedStudents);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        
        // En caso de error, mostrar datos por defecto
        setStudents([
          {
            id: 1,
            name: 'Sin datos disponibles',
            email: 'error@servidor.com',
            course: 'Error al cargar',
            progress: 0,
            lastActivity: new Date().toISOString().split('T')[0],
            status: 'inactive',
            avatar: '❌'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Gestión de Estudiantes 👥</h2>
        <p className="text-purple-100">
          Administra y da seguimiento a tus estudiantes
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Estudiantes</p>
              <p className="text-xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-xl font-bold text-gray-900">
                {students.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-xl font-bold text-gray-900">
                {students.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progreso Promedio</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar estudiante
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por curso
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Todos los cursos</option>
              <option value="React Avanzado">React Avanzado</option>
              <option value="JavaScript Moderno">JavaScript Moderno</option>
              <option value="Node.js Fundamentals">Node.js Fundamentals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Estudiantes ({filteredStudents.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{student.avatar}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                    <p className="text-gray-600">{student.email}</p>
                    <p className="text-sm text-gray-500">Curso: {student.course}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Progreso</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Estado</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                      {getStatusText(student.status)}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Última actividad</p>
                    <p className="text-sm text-gray-900">{student.lastActivity}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                      Mensaje
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Ver perfil
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron estudiantes</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;