import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminStats = () => {
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userStatsResponse, courseStatsResponse] = await Promise.all([
        api.get('/api/admin/users/stats'),
        api.get('/api/admin/courses/stats')
      ]);

      setUserStats(userStatsResponse.data.data);
      setCourseStats(courseStatsResponse.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card">
        <div className="error-message">
          <p>{error}</p>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={fetchStats}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="admin-stats">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">📊 Estadísticas del Sistema</h2>
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={fetchStats}
            title="Actualizar estadísticas"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* User Statistics */}
        <div className="stats-section">
          <h3 className="stats-section-title">👥 Estadísticas de Usuarios</h3>
          <div className="stats-grid">
            <StatCard
              title="Total de Usuarios"
              value={userStats?.total_users || 0}
              icon="👥"
              color="primary"
            />
            <StatCard
              title="Estudiantes"
              value={userStats?.students || 0}
              subtitle={`${((userStats?.students / userStats?.total_users) * 100 || 0).toFixed(1)}% del total`}
              icon="🎓"
              color="blue"
            />
            <StatCard
              title="Instructores"
              value={userStats?.instructors || 0}
              subtitle={`${((userStats?.instructors / userStats?.total_users) * 100 || 0).toFixed(1)}% del total`}
              icon="👨‍🏫"
              color="green"
            />
            <StatCard
              title="Administradores"
              value={userStats?.admins || 0}
              icon="🔐"
              color="purple"
            />
            <StatCard
              title="Usuarios Activos"
              value={userStats?.active_users || 0}
              subtitle={`${((userStats?.active_users / userStats?.total_users) * 100 || 0).toFixed(1)}% del total`}
              icon="✅"
              color="success"
            />
            <StatCard
              title="Emails Verificados"
              value={userStats?.verified_users || 0}
              subtitle={`${((userStats?.verified_users / userStats?.total_users) * 100 || 0).toFixed(1)}% del total`}
              icon="📧"
              color="info"
            />
            <StatCard
              title="Nuevos (30 días)"
              value={userStats?.new_users_last_month || 0}
              subtitle="Registros recientes"
              icon="🆕"
              color="warning"
            />
          </div>
        </div>

        {/* Course Statistics */}
        <div className="stats-section">
          <h3 className="stats-section-title">📚 Estadísticas de Cursos</h3>
          <div className="stats-grid">
            <StatCard
              title="Total de Cursos"
              value={courseStats?.total_courses || 0}
              icon="📚"
              color="primary"
            />
            <StatCard
              title="Cursos Publicados"
              value={courseStats?.published_courses || 0}
              subtitle={`${((courseStats?.published_courses / courseStats?.total_courses) * 100 || 0).toFixed(1)}% del total`}
              icon="🌟"
              color="success"
            />
            <StatCard
              title="Borradores"
              value={courseStats?.draft_courses || 0}
              subtitle="En desarrollo"
              icon="📝"
              color="warning"
            />
            <StatCard
              title="Eliminados"
              value={courseStats?.deleted_courses || 0}
              icon="🗑️"
              color="danger"
            />
            <StatCard
              title="Precio Promedio"
              value={`$${courseStats?.average_price || '0.00'}`}
              icon="💰"
              color="info"
            />
            <StatCard
              title="Cursos Gratuitos"
              value={courseStats?.free_courses || 0}
              subtitle={`${((courseStats?.free_courses / courseStats?.total_courses) * 100 || 0).toFixed(1)}% del total`}
              icon="🆓"
              color="blue"
            />
            <StatCard
              title="Cursos de Pago"
              value={courseStats?.paid_courses || 0}
              subtitle={`${((courseStats?.paid_courses / courseStats?.total_courses) * 100 || 0).toFixed(1)}% del total`}
              icon="💳"
              color="green"
            />
            <StatCard
              title="Nuevos (30 días)"
              value={courseStats?.new_courses_last_month || 0}
              subtitle="Cursos recientes"
              icon="🆕"
              color="purple"
            />
            <StatCard
              title="Total Inscripciones"
              value={courseStats?.total_enrollments || 0}
              icon="📋"
              color="primary"
            />
            <StatCard
              title="Cursos con Inscripciones"
              value={courseStats?.courses_with_enrollments || 0}
              subtitle={`${((courseStats?.courses_with_enrollments / courseStats?.total_courses) * 100 || 0).toFixed(1)}% del total`}
              icon="🎯"
              color="success"
            />
            <StatCard
              title="Promedio Inscripciones"
              value={courseStats?.avg_enrollments_per_course || '0.0'}
              subtitle="Por curso"
              icon="📈"
              color="info"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="stats-section">
          <h3 className="stats-section-title">⚡ Acciones Rápidas</h3>
          <div className="quick-actions">
            <button className="admin-btn admin-btn-primary">
              👥 Gestionar Usuarios
            </button>
            <button className="admin-btn admin-btn-primary">
              📚 Gestionar Cursos
            </button>
            <button className="admin-btn admin-btn-secondary">
              📊 Exportar Datos
            </button>
            <button className="admin-btn admin-btn-secondary">
              🔧 Configuración
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-stats {
          width: 100%;
        }

        .stats-section {
          margin-bottom: 3rem;
        }

        .stats-section-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(79, 70, 229, 0.1);
        }

        .stat-card-blue .stat-icon { background: rgba(59, 130, 246, 0.1); }
        .stat-card-green .stat-icon { background: rgba(16, 185, 129, 0.1); }
        .stat-card-purple .stat-icon { background: rgba(139, 92, 246, 0.1); }
        .stat-card-success .stat-icon { background: rgba(34, 197, 94, 0.1); }
        .stat-card-info .stat-icon { background: rgba(6, 182, 212, 0.1); }
        .stat-card-warning .stat-icon { background: rgba(245, 158, 11, 0.1); }
        .stat-card-danger .stat-icon { background: rgba(239, 68, 68, 0.1); }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .stat-title {
          font-size: 1rem;
          font-weight: 500;
          color: #4b5563;
          margin: 0;
        }

        .stat-subtitle {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-icon {
            font-size: 2rem;
            width: 50px;
            height: 50px;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .quick-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminStats;