import React from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  confirmClass = 'admin-btn-danger',
  icon = '⚠️'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <div className="confirmation-icon">{icon}</div>
          <h3 className="confirmation-title">{title}</h3>
        </div>
        
        <div className="confirmation-body">
          <p className="confirmation-message">{message}</p>
        </div>
        
        <div className="confirmation-actions">
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`admin-btn ${confirmClass}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .confirmation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          animation: fadeIn 0.3s ease-out;
        }

        .confirmation-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideIn 0.3s ease-out;
        }

        .confirmation-header {
          padding: 2rem 2rem 1rem 2rem;
          text-align: center;
        }

        .confirmation-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }

        .confirmation-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .confirmation-body {
          padding: 0 2rem 1.5rem 2rem;
          text-align: center;
        }

        .confirmation-message {
          margin: 0;
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.6;
        }

        .confirmation-actions {
          padding: 1.5rem 2rem 2rem 2rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .confirmation-actions .admin-btn {
          min-width: 100px;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
        }

        .admin-btn-danger {
          background: #ef4444;
          color: white;
          border: 1px solid #ef4444;
        }

        .admin-btn-danger:hover {
          background: #dc2626;
          border-color: #dc2626;
          transform: translateY(-1px);
        }

        .admin-btn-success {
          background: #10b981;
          color: white;
          border: 1px solid #10b981;
        }

        .admin-btn-success:hover {
          background: #059669;
          border-color: #059669;
          transform: translateY(-1px);
        }

        .admin-btn-warning {
          background: #f59e0b;
          color: white;
          border: 1px solid #f59e0b;
        }

        .admin-btn-warning:hover {
          background: #d97706;
          border-color: #d97706;
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 480px) {
          .confirmation-modal {
            width: 95%;
            margin: 1rem;
          }

          .confirmation-header {
            padding: 1.5rem 1.5rem 1rem 1.5rem;
          }

          .confirmation-body {
            padding: 0 1.5rem 1rem 1.5rem;
          }

          .confirmation-actions {
            padding: 1rem 1.5rem 1.5rem 1.5rem;
            flex-direction: column;
          }

          .confirmation-actions .admin-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;