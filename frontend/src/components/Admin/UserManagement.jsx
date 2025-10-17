import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from './ConfirmationModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: 'all',
    search: '',
    isActive: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    role: 'student',
    isActive: true,
    emailVerified: false,
    bio: '',
    profileImageUrl: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== 'all') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await api.get(`/api/admin/users?${queryParams}`);
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar usuarios');
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

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name || '',
        lastname: user.lastname || '',
        email: user.email || '',
        password: '',
        role: user.role || 'student',
        isActive: user.is_active !== undefined ? user.is_active : true,
        emailVerified: user.email_verified || false,
        bio: user.bio || '',
        profileImageUrl: user.profile_image_url || ''
      });
    } else {
      setFormData({
        name: '',
        lastname: '',
        email: '',
        password: '',
        role: 'student',
        isActive: true,
        emailVerified: false,
        bio: '',
        profileImageUrl: ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: 'student',
      isActive: true,
      emailVerified: false,
      bio: '',
      profileImageUrl: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await api.post('/api/admin/users', formData);
      } else {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/api/admin/users/${selectedUser.id}`, updateData);
      }
      
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const confirmAction = (action, user) => {
    setConfirmationAction({ action, user });
    setShowConfirmation(true);
  };

  const executeAction = async () => {
    try {
      const { action, user } = confirmationAction;
      
      switch (action) {
        case 'delete':
          await api.delete(`/api/admin/users/${user.id}`);
          break;
        case 'reactivate':
          await api.patch(`/api/admin/users/${user.id}/reactivate`);
          break;
        default:
          break;
      }
      
      setShowConfirmation(false);
      setConfirmationAction(null);
      fetchUsers();
    } catch (error) {
      console.error('Error executing action:', error);
      setError(error.response?.data?.message || 'Error al ejecutar la acción');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Estudiante',
      instructor: 'Instructor',
      admin: 'Administrador'
    };
    return roles[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      student: 'admin-status-badge',
      instructor: 'admin-status-badge admin-status-pending',
      admin: 'admin-status-badge admin-status-active'
    };
    return classes[role] || 'admin-status-badge';
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-card">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">👥 Gestión de Usuarios</h2>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => openModal('create')}
          >
            ➕ Nuevo Usuario
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
                placeholder="Nombre, email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Rol:</label>
              <select
                className="admin-form-select"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="student">Estudiantes</option>
                <option value="instructor">Instructores</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Estado:</label>
              <select
                className="admin-form-select"
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ordenar por:</label>
              <select
                className="admin-form-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="created_at">Fecha de registro</option>
                <option value="first_name">Nombre</option>
                <option value="last_name">Apellido</option>
                <option value="email">Email</option>
                <option value="role">Rol</option>
              </select>
            </div>

            <button 
              className="admin-btn admin-btn-secondary"
              onClick={fetchUsers}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.profile_image_url ? (
                          <img src={user.profile_image_url} alt={user.name} />
                        ) : (
                          <span>{user.name?.charAt(0)}{user.lastname?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="user-name">{user.name} {user.lastname}</div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{user.email}</div>
                    {user.email_verified && (
                      <span className="verified-badge">✓ Verificado</span>
                    )}
                  </td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${user.is_active ? 'admin-status-active' : 'admin-status-inactive'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openModal('edit', user)}
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      
                      {user.is_active ? (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => confirmAction('delete', user)}
                          title="Desactivar usuario"
                        >
                          🚫
                        </button>
                      ) : (
                        <button
                          className="action-btn activate-btn"
                          onClick={() => confirmAction('reactivate', user)}
                          title="Reactivar usuario"
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
              ({pagination.total} usuarios)
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

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Nombre *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Apellido *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.lastname}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email *</label>
                <input
                  type="email"
                  className="admin-form-input"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Contraseña {modalMode === 'create' ? '*' : '(dejar vacío para mantener actual)'}
                </label>
                <input
                  type="password"
                  className="admin-form-input"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={modalMode === 'create'}
                />
              </div>

              <div className="form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Rol *</label>
                  <select
                    className="admin-form-select"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    required
                  >
                    <option value="student">Estudiante</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Estado</label>
                  <select
                    className="admin-form-select"
                    value={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">URL de Imagen de Perfil</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Biografía</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Información adicional sobre el usuario..."
                  rows="3"
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.emailVerified}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailVerified: e.target.checked }))}
                  />
                  Email verificado
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
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
          title={confirmationAction?.action === 'delete' ? 'Desactivar Usuario' : 'Reactivar Usuario'}
          message={
            confirmationAction?.action === 'delete' 
              ? `¿Estás seguro de que deseas desactivar al usuario "${confirmationAction?.user?.name} ${confirmationAction?.user?.lastname}"?`
              : `¿Estás seguro de que deseas reactivar al usuario "${confirmationAction?.user?.name} ${confirmationAction?.user?.lastname}"?`
          }
          confirmText={confirmationAction?.action === 'delete' ? 'Desactivar' : 'Reactivar'}
          confirmClass={confirmationAction?.action === 'delete' ? 'admin-btn-danger' : 'admin-btn-success'}
        />
      )}

      <style jsx>{`
        .user-management {
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

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-name {
          font-weight: 500;
          color: #1f2937;
        }

        .user-id {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .verified-badge {
          font-size: 0.8rem;
          color: #059669;
          font-weight: 500;
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
        }

        .checkbox-group {
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
        }
      `}</style>
    </div>
  );
};

export default UserManagement;