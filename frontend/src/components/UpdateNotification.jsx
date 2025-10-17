import React, { useState, useEffect } from 'react';
import { X, GitBranch, Clock, CheckCircle } from 'lucide-react';

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpdateInfo();
  }, []);

  const fetchUpdateInfo = async () => {
    try {
      setIsLoading(true);
      
      // Intentar obtener información de build desde el archivo generado por GitHub Actions
      const response = await fetch('/build-info.json');
      
      if (response.ok) {
        const data = await response.json();
        setUpdateInfo(data);
        
        // Verificar si es una actualización nueva (comparar con localStorage)
        const lastSeenUpdate = localStorage.getItem('lastSeenUpdate');
        if (!lastSeenUpdate || lastSeenUpdate !== data.commitSha) {
          setIsVisible(true);
        }
      } else {
        // Fallback: usar información estática si no hay archivo de build
        const fallbackInfo = {
          version: '1.0.0',
          commitSha: 'latest',
          commitMessage: 'Última actualización disponible',
          buildDate: new Date().toISOString(),
          branch: 'main'
        };
        setUpdateInfo(fallbackInfo);
      }
    } catch (error) {
      console.warn('No se pudo obtener información de actualización:', error);
      // No mostrar notificación si hay error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (updateInfo?.commitSha) {
      localStorage.setItem('lastSeenUpdate', updateInfo.commitSha);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getTimeSince = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Hace un momento';
      if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `Hace ${diffInHours}h`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    } catch {
      return '';
    }
  };

  // No renderizar nada si está cargando o no hay información
  if (isLoading || !updateInfo) {
    return null;
  }

  // No renderizar si no es visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg border border-blue-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <span className="font-semibold text-sm">Nueva Actualización</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Commit Message */}
          <p className="text-sm text-white/90 leading-relaxed">
            {updateInfo.commitMessage || 'Mejoras y actualizaciones disponibles'}
          </p>

          {/* Build Info */}
          <div className="flex items-center justify-between text-xs text-white/70">
            <div className="flex items-center space-x-1">
              <GitBranch className="w-3 h-3" />
              <span>{updateInfo.branch || 'main'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{getTimeSince(updateInfo.buildDate)}</span>
            </div>
          </div>

          {/* Version & Date */}
          <div className="text-xs text-white/60 pt-1 border-t border-white/20">
            <div>Versión: {updateInfo.version || '1.0.0'}</div>
            <div>Actualizado: {formatDate(updateInfo.buildDate)}</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2 border-t border-white/20">
          <button
            onClick={handleDismiss}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-3 rounded transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;