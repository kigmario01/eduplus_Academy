import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import AdminStats from './AdminStats';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'stats', label: 'Estadísticas', icon: '📊' },
    { id: 'users', label: 'Gestión de Usuarios', icon: '👥' },
    { id: 'courses', label: 'Gestión de Cursos', icon: '📚' }
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <h1>🎓 EduPlus Admin</h1>
          </div>
          <div className="admin-user-info">
            <span className="admin-welcome">
              Bienvenido, {user?.name} {user?.lastname}
            </span>
            <button 
              className="admin-logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-content">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'courses' && <CourseManagement />}
        </div>
      </main>

      {/* Footer */}
      <footer className="admin-footer">
        <div className="admin-footer-content">
          <p>&copy; 2024 EduPlus Academy - Panel de Administración</p>
          <div className="admin-footer-links">
            <span>Versión 1.0</span>
            <span>•</span>
            <span>Sistema de Gestión Educativa</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;