import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaPlus, FaEdit, FaTrash, FaPlay, FaStop, FaEye } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { activityTracksApi } from '../Services/attendanceNewApi';
import type { ActivityTrack, ActivityTrackWithStats } from '../Types/attendanceNew';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityTrackWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityTrack | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    status: 'active' as 'active' | 'inactive' | 'completed',
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await activityTracksApi.getAll(1, 1000); // Get all activities
      setActivities(response.data);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await activityTracksApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        event_date: formData.event_date,
        event_time: formData.event_time || undefined,
        location: formData.location.trim() || undefined,
        status: formData.status,
      });

      setSuccess('Actividad creada exitosamente');
      setFormData({ name: '', description: '', event_date: '', event_time: '', location: '', status: 'active' });
      setShowCreateForm(false);
      await loadActivities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al crear actividad');
      console.error('Error creating activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingActivity) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await activityTracksApi.update(editingActivity.id!, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        event_date: formData.event_date,
        event_time: formData.event_time || undefined,
        location: formData.location.trim() || undefined,
        status: formData.status,
      });

      setSuccess('Actividad actualizada exitosamente');
      setEditingActivity(null);
      setFormData({ name: '', description: '', event_date: '', event_time: '', location: '', status: 'active' });
      await loadActivities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al actualizar actividad');
      console.error('Error updating activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await activityTracksApi.delete(id);
      setSuccess('Actividad eliminada exitosamente');
      await loadActivities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al eliminar actividad');
      console.error('Error deleting activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScanning = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await activityTracksApi.startScanning(id);
      setSuccess('Escaneo iniciado exitosamente');
      await loadActivities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al iniciar escaneo');
      console.error('Error starting scanning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopScanning = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await activityTracksApi.stopScanning(id);
      setSuccess('Escaneo detenido exitosamente');
      await loadActivities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al detener escaneo');
      console.error('Error stopping scanning:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (activity: ActivityTrack) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || '',
      event_date: activity.event_date,
      event_time: activity.event_time || '',
      location: activity.location || '',
      status: activity.status || 'active',
    });
    setShowCreateForm(true);
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingActivity(null);
    setFormData({ name: '', description: '', event_date: '', event_time: '', location: '', status: 'active' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'inactive': return 'Inactiva';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/attendance"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FaCalendarAlt className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Gestión de Actividades</h1>
                  <p className="text-sm text-gray-600">Crea y administra actividades de asistencia</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              Nueva Actividad
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              
              <form onSubmit={editingActivity ? handleUpdateActivity : handleCreateActivity} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Actividad *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ej: Taller de Cocina"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 400) {
                         setFormData({ ...formData, description: e.target.value });
                      }
                     }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descripción de la actividad..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha del Evento *
                    </label>
                    <input
                      type="date"
                      id="event_date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                       min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="event_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Hora del Evento
                    </label>
                    <input
                      type="time"
                      id="event_time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      min={
                        formData.event_date === new Date().toISOString().split("T")[0]
                         ? new Date().toTimeString().slice(0, 5)
                         : undefined
                      } 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ej: Salón Principal"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editingActivity ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <FaPlus className="w-4 h-4" />
                        {editingActivity ? 'Actualizar' : 'Crear'} Actividad
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Actividades</h2>
          </div>
          
          {loading && !showCreateForm ? (
            <div className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-3 text-gray-600">Cargando actividades...</span>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-6 text-center">
              <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
              <p className="text-gray-600 mb-4">Crea tu primera actividad para comenzar a gestionar la asistencia.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                Crear Primera Actividad
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actividad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escaneo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asistencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-wrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                          {activity.description && (
                            <div className="text-sm text-gray-500 break-words max-w-xs">
                              {activity.description .length > 100
                                ? `${activity.description.slice(0, 100)}…`
                                : activity.description
                            }</div>
                          )}
                          {activity.location && (
                            <div className="text-sm text-gray-500"> {activity.location}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(activity.event_date).toLocaleDateString('es-ES')}
                        </div>
                        {activity.event_time && (
                          <div className="text-sm text-gray-500">
                            {activity.event_time.slice(0, 5)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status || 'inactive')}`}>
                          {getStatusText(activity.status || 'inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activity.scanning_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaPlay className="w-3 h-3 mr-1" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <FaStop className="w-3 h-3 mr-1" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.total_attendance || 0} asistentes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            to="/admin/attendance/beneficiaries"
                            search={{ activityId: activity.id }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver asistencia"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditForm(activity)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          {activity.scanning_active ? (
                            <button
                              onClick={() => handleStopScanning(activity.id!)}
                              className="text-red-600 hover:text-red-900"
                              title="Detener escaneo"
                            >
                              <FaStop className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartScanning(activity.id!)}
                              className="text-green-600 hover:text-green-900"
                              title="Iniciar escaneo"
                            >
                              <FaPlay className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteActivity(activity.id!)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
