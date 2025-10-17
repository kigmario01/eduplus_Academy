import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from './ConfirmationModal';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: 'all',
    instructor: 'all',
    status: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    instructorId: '',
    categoryId: '',
    price: '',
    duration: '',
    level: 'beginner',
    imageUrl: '',
    videoUrl: '',
    requirements: '',
    learningObjectives: '',
    isActive: true,
    isFeatured: false,
    maxStudents: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [instructorsRes, categoriesRes] = await Promise.all([
        api.get('/api/admin/users?role=instructor&limit=100'),
        api.get('/api/categories')
      ]);
      
      setInstructors(instructorsRes.data.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Error al cargar datos iniciales');
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== 'all') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await api.get(`/api/admin/courses?${queryParams}`);
      setCourses(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const openModal = (mode, course = null) => {
    setModalMode(mode);
    setSelectedCourse(course);
    
    if (mode === 'edit' && course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        shortDescription: course.short_description || '',
        instructorId: course.instructor_id || '',
        categoryId: course.category_id || '',
        price: course.price || '',
        duration: course.duration || '',
        level: course.level || 'beginner',
        imageUrl: course.image_url || '',
        videoUrl: course.video_url || '',
        requirements: course.requirements || '',
        learningObjectives: course.learning_objectives || '',
        isActive: course.is_active !== undefined ? course.is_active : true,
        isFeatured: course.is_featured || false,
        maxStudents: course.max_students || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        instructorId: '',
        categoryId: '',
        price: '',
        duration: '',
        level: 'beginner',
        imageUrl: '',
        videoUrl: '',
        requirements: '',
        learningObjectives: '',
        isActive: true,
        isFeatured: false,
        maxStudents: ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      instructorId: '',
      categoryId: '',
      price: '',
      duration: '',
      level: 'beginner',
      imageUrl: '',
      videoUrl: '',
      requirements: '',
      learningObjectives: '',
      isActive: true,
      isFeatured: false,
      maxStudents: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 0,
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : null
      };

      if (modalMode === 'create') {
        await api.post('/api/admin/courses', submitData);
      } else {
        await api.put(`/api/admin/courses/${selectedCourse.id}`, submitData);
      }
      
      closeModal();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      setError(error.response?.data?.message || 'Error al guardar curso');
    }
  };

  const confirmAction = (action, course) => {
    setConfirmationAction({ action, course });
    setShowConfirmation(true);
  };

  const executeAction = async () => {
    try {
      const { action, course } = confirmationAction;
      
      switch (action) {
        case 'delete':
          await api.delete(`/api/admin/courses/${course.id}`);
          break;
        case 'restore':
          await api.patch(`/api/admin/courses/${course.id}/restore`);
          break;
        default:
          break;
      }
      
      setShowConfirmation(false);
      setConfirmationAction(null);
      fetchCourses();
    } catch (error) {
      console.error('Error executing action:', error);
      setError(error.response?.data?.message || 'Error al ejecutar la acción');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelLabel = (level) => {
    const levels = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    };
    return levels[level] || level;
  };

  const getLevelBadgeClass = (level) => {
    const classes = {
      beginner: 'admin-status-badge admin-status-active',
      intermediate: 'admin-status-badge admin-status-pending',
      advanced: 'admin-status-badge admin-status-inactive'
    };
    return classes[level] || 'admin-status-badge';
  };

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor ? `${instructor.name} ${instructor.lastname}` : 'No asignado';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  if (loading && courses.length === 0) {
    return (
      <div className="admin-card">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-management">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">📚 Gestión de Cursos</h2>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => openModal('create')}
          >
            ➕ Nuevo Curso
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Buscar:</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Título del curso..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Categoría:</label>
              <select
                className="admin-form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">Todas</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Instructor:</label>
              <select
                className="admin-form-select"
                value={filters.instructor}
                onChange={(e) => handleFilterChange('instructor', e.target.value)}
              >
                <option value="all">Todos</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name} {instructor.lastname}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Estado:</label>
              <select
                className="admin-form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <button 
              className="admin-btn admin-btn-secondary"
              onClick={fetchCourses}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Courses Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Instructor</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th>Estudiantes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <div className="course-info">
                      <div className="course-image">
                        {course.image_url ? (
                          <img src={course.image_url} alt={course.title} />
                        ) : (
                          <div className="course-placeholder">📚</div>
                        )}
                      </div>
                      <div>
                        <div className="course-title">{course.title}</div>
                        <div className="course-id">ID: {course.id}</div>
                        {course.is_featured && (
                          <span className="featured-badge">⭐ Destacado</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{getInstructorName(course.instructor_id)}</td>
                  <td>{getCategoryName(course.category_id)}</td>
                  <td>{formatPrice(course.price)}</td>
                  <td>
                    <span className={getLevelBadgeClass(course.level)}>
                      {getLevelLabel(course.level)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${course.is_active ? 'admin-status-active' : 'admin-status-inactive'}`}>
                      {course.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="enrollment-info">
                      <span>{course.enrolled_count || 0}</span>
                      {course.max_students && (
                        <span className="max-students">/ {course.max_students}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openModal('edit', course)}
                        title="Editar curso"
                      >
                        ✏️
                      </button>
                      
                      {course.is_active ? (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => confirmAction('delete', course)}
                          title="Desactivar curso"
                        >
                          🚫
                        </button>
                      ) : (
                        <button
                          className="action-btn activate-btn"
                          onClick={() => confirmAction('restore', course)}
                          title="Reactivar curso"
                        >
                          ✅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="admin-btn admin-btn-secondary"
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              ← Anterior
            </button>
            
            <span className="pagination-info">
              Página {pagination.page} de {pagination.totalPages} 
              ({pagination.total} cursos)
            </span>
            
            <button
              className="admin-btn admin-btn-secondary"
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Crear Curso' : 'Editar Curso'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="admin-form-group full-width">
                  <label className="admin-form-label">Título del Curso *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Descripción Corta *</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Breve descripción del curso..."
                  rows="2"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Descripción Completa *</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada del curso..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Instructor *</label>
                  <select
                    className="admin-form-select"
                    value={formData.instructorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructorId: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar instructor</option>
                    {instructors.map(instructor => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name} {instructor.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Categoría *</label>
                  <select
                    className="admin-form-select"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Precio (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="admin-form-input"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Duración (horas) *</label>
                  <input
                    type="number"
                    min="1"
                    className="admin-form-input"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Nivel *</label>
                  <select
                    className="admin-form-select"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    required
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Máx. Estudiantes</label>
                  <input
                    type="number"
                    min="1"
                    className="admin-form-input"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">URL de Imagen</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">URL de Video</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://ejemplo.com/video.mp4"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Requisitos</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Conocimientos previos necesarios..."
                  rows="3"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Objetivos de Aprendizaje</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.learningObjectives}
                  onChange={(e) => setFormData(prev => ({ ...prev, learningObjectives: e.target.value }))}
                  placeholder="Qué aprenderán los estudiantes..."
                  rows="3"
                />
              </div>

              <div className="checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Curso activo
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  Curso destacado
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {modalMode === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={executeAction}
          title={confirmationAction?.action === 'delete' ? 'Desactivar Curso' : 'Reactivar Curso'}
          message={
            confirmationAction?.action === 'delete' 
              ? `¿Estás seguro de que deseas desactivar el curso "${confirmationAction?.course?.title}"?`
              : `¿Estás seguro de que deseas reactivar el curso "${confirmationAction?.course?.title}"?`
          }
          confirmText={confirmationAction?.action === 'delete' ? 'Desactivar' : 'Reactivar'}
          confirmClass={confirmationAction?.action === 'delete' ? 'admin-btn-danger' : 'admin-btn-success'}
        />
      )}

      <style jsx>{`
        .course-management {
          width: 100%;
        }

        .error-banner {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #991b1b;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .filters-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .filters-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .table-container {
          overflow-x: auto;
          margin-bottom: 2rem;
        }

        .course-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .course-image {
          width: 50px;
          height: 35px;
          border-radius: 6px;
          overflow: hidden;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .course-placeholder {
          font-size: 1.2rem;
        }

        .course-title {
          font-weight: 500;
          color: #1f2937;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .course-id {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .featured-badge {
          font-size: 0.8rem;
          color: #f59e0b;
          font-weight: 500;
        }

        .enrollment-info {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .max-students {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .edit-btn:hover {
          background: #dbeafe;
          border-color: #3b82f6;
        }

        .delete-btn:hover {
          background: #fee2e2;
          border-color: #ef4444;
        }

        .activate-btn:hover {
          background: #d1fae5;
          border-color: #10b981;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }

        .pagination-info {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .large-modal {
          max-width: 800px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #1f2937;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-form {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-row:has(.full-width) {
          grid-template-columns: 1fr;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .checkbox-row {
          display: flex;
          gap: 2rem;
          margin: 1rem 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .filters-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
          }

          .checkbox-row {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseManagement;