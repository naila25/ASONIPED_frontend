import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaPlay, FaStop, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { activityTracksApi } from '../Services/attendanceNewApi';
import type { ActivityTrack, ActivitySelectorProps } from '../Types/attendanceNew';

export default function ActivitySelector({ 
  onActivitySelect, 
  selectedActivity, 
  showCreateButton = false, 
  onCreateActivity 
}: ActivitySelectorProps) {
  const [activities, setActivities] = useState<ActivityTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanningStatus, setScanningStatus] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchActivities();
    checkScanningStatus();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityTracksApi.getAll(1, 50, 'active');
      setActivities(response.data);
    } catch (err) {
      setError('Error al cargar las actividades');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkScanningStatus = async () => {
    try {
      const activeActivity = await activityTracksApi.getActiveScanning();
      if (activeActivity) {
        setScanningStatus({ [activeActivity.id!]: true });
      }
    } catch (err) {
      console.error('Error checking scanning status:', err);
    }
  };

  const handleStartScanning = async (activityId: number) => {
    try {
      await activityTracksApi.startScanning(activityId);
      setScanningStatus({ [activityId]: true });
      // Update the selected activity if it's the one being scanned
      if (selectedActivity?.id === activityId) {
        const updatedActivity = { ...selectedActivity, scanning_active: true };
        onActivitySelect(updatedActivity);
      }
    } catch (err) {
      console.error('Error starting scanning:', err);
      alert('Error al iniciar el escaneo');
    }
  };

  const handleStopScanning = async (activityId: number) => {
    try {
      await activityTracksApi.stopScanning(activityId);
      setScanningStatus({ [activityId]: false });
      // Update the selected activity if it's the one being stopped
      if (selectedActivity?.id === activityId) {
        const updatedActivity = { ...selectedActivity, scanning_active: false };
        onActivitySelect(updatedActivity);
      }
    } catch (err) {
      console.error('Error stopping scanning:', err);
      alert('Error al detener el escaneo');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'inactive': return 'Inactiva';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <FaTimes className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar actividades</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchActivities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Seleccionar Actividad</h2>
          <p className="text-gray-600">Elige una actividad para gestionar la asistencia</p>
        </div>
        {showCreateButton && onCreateActivity && (
          <button
            onClick={onCreateActivity}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Actividades
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades activas</h3>
          <p className="text-gray-600 mb-4">Crea una nueva actividad para comenzar a gestionar la asistencia</p>
          {showCreateButton && onCreateActivity && (
            <button
              onClick={onCreateActivity}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              Crear Primera Actividad
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const isSelected = selectedActivity?.id === activity.id;
            const isScanning = scanningStatus[activity.id!];
            
            return (
              <div
                key={activity.id}
                className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => onActivitySelect(activity)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate flex-1 min-w-0">{activity.name}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(activity.status)}`}>
                          {getStatusText(activity.status)}
                        </span>
                        {isScanning && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                            🔴 Escaneando
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2 break-words">{activity.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1 min-w-0">
                        <FaCalendarAlt className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{formatDate(activity.event_date)}</span>
                      </div>
                      
                      {activity.event_time && (
                        <div className="flex items-center gap-1 min-w-0">
                          <FaClock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{formatTime(activity.event_time)}</span>
                        </div>
                      )}
                      
                      {activity.location && (
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <FaMapMarkerAlt className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{activity.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {isSelected && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <FaCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Seleccionada</span>
                      </div>
                    )}
                    
                    {activity.status === 'active' && (
                      <div className="flex gap-1">
                        {!isScanning ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartScanning(activity.id!);
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Iniciar escaneo QR"
                          >
                            <FaPlay className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStopScanning(activity.id!);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Detener escaneo QR"
                          >
                            <FaStop className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedActivity && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Actividad Seleccionada</h4>
          <p className="text-blue-800">{selectedActivity.name}</p>
          {selectedActivity.scanning_active && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Escaneo QR activo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
