import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Users, 
  Clock, 
  Play, 
  Heart, 
  Share, 
  Check 
} from 'lucide-react';
import { courseApi as api } from '@/lib/api';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [slug]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/courses/${slug}`);
      const courseData = response?.data;
      
      if (courseData) {
        setCourse(courseData);
      } else {
        setCourse(null);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course?.id) return;
    try {
      setEnrolling(true);
      const res = await api.post('/enrollments/enroll', { course_id: course.id });
      if (res?.data?.success) {
        alert('¡Inscripción realizada exitosamente!');
        navigate('/dashboard/courses');
      } else {
        alert(res?.data?.message || 'No se pudo completar la inscripción');
      }
    } catch (error) {
      const message = error?.message || 'Error al realizar la inscripción';
      if (/token/i.test(message) || /autenticación/i.test(message) || /401/.test(message)) {
        alert('Debes iniciar sesión para inscribirte');
        navigate('/login');
      } else {
        alert(message);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleGoToEvaluation = () => {
    if (course?.id) {
      navigate(`/evaluation/${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del curso */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información del curso */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.category_name}
                </span>
                <span className="ml-3 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{course.short_description}</p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-blue-200 ml-1">({course.total_reviews} reseñas)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-200 mr-1" />
                  <span>{course.total_students} estudiantes</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-200 mr-1" />
                  <span>{course.duration_hours} horas</span>
                </div>
              </div>

              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt={course.instructor_name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">{course.instructor_name}</p>
                  <p className="text-blue-200 text-sm">Instructor</p>
                </div>
              </div>
            </div>

            {/* Card de compra */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Play className="h-16 w-16 text-white" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${course.price}
                  </div>
                  <div className="text-sm text-gray-500">Acceso de por vida</div>
                </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`w-full ${enrolling ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-4 rounded-lg font-semibold transition-colors`}
              >
                {enrolling ? 'Matriculando...' : 'Matricularme ahora'}
              </button>
              <button
                onClick={handleGoToEvaluation}
                className="w-full bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Ir a evaluación
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={toggleWishlist}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                      <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
                      Lista de deseos
                    </button>
                    <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      <Share className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Acceso de por vida
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Certificado de finalización
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Acceso en móvil y TV
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido del curso */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Descripción' },
                  { id: 'curriculum', name: 'Contenido' },
                  { id: 'instructor', name: 'Instructor' },
                  { id: 'reviews', name: 'Reseñas' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido de tabs */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Descripción del curso</h3>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Lo que aprenderás</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.what_you_learn?.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Requisitos</h3>
                    <ul className="space-y-2">
                      {course.requirements?.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">¿Para quién es este curso?</h3>
                    <ul className="space-y-2">
                      {course.target_audience?.map((audience, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Contenido del curso</h3>
                  <div className="space-y-4">
                    {course.sections?.map((section, sectionIndex) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">
                            Sección {sectionIndex + 1}: {section.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {section.lessons?.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="px-6 py-4 flex items-center justify-between">
                              <div className="flex items-center">
                                <Play className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                  <p className="font-medium text-gray-900">{lesson.title}</p>
                                  <p className="text-sm text-gray-500">{lesson.duration_minutes} min</p>
                                </div>
                              </div>
                              {lesson.is_preview && (
                                <span className="text-blue-600 text-sm font-medium">Vista previa</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Sobre el instructor</h3>
                  <div className="flex items-start space-x-4">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                      alt={course.instructor_name}
                      className="w-20 h-20 rounded-full"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{course.instructor_name}</h4>
                      <p className="text-gray-600 mb-4">Instructor especializado en {course.category_name}</p>
                      <p className="text-gray-700">
                        Instructor experimentado con más de 5 años de experiencia en el campo. 
                        Ha ayudado a miles de estudiantes a alcanzar sus objetivos profesionales.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Reseñas de estudiantes</h3>
                  <div className="space-y-6">
                    {/* Resumen de calificaciones */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900">{course.rating}</div>
                          <div className="flex items-center justify-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(course.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{course.total_reviews} reseñas</div>
                        </div>
                      </div>
                    </div>

                    {/* Reseñas individuales */}
                    <div className="space-y-4">
                      {course.reviews && course.reviews.length > 0 ? (
                        course.reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-4">
                            <div className="flex items-start space-x-3">
                              <img
                                src={review.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                                alt={review.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-gray-900">{review.name}</h5>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">{review.date}</span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Reseñas próximamente</p>
                          <p className="text-sm text-gray-400 mt-2">Sé el primero en dejar una reseña de este curso</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Cursos relacionados</h4>
              <div className="space-y-4">
                {course.related_courses && course.related_courses.length > 0 ? (
                  course.related_courses.map((relatedCourse) => (
                    <div key={relatedCourse.id} className="flex space-x-3">
                      <img
                        src={relatedCourse.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=75&fit=crop'}
                        alt={relatedCourse.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {relatedCourse.title}
                        </h5>
                        <p className="text-sm text-gray-600">${relatedCourse.price}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Cursos relacionados próximamente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;