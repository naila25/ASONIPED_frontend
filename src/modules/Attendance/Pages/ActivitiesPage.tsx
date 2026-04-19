import { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { activityTracksApi } from '../Services/attendanceNewApi';
import AttendancePageHeader from '../Components/AttendancePageHeader';
import type { ActivityTrack, ActivityTrackWithStats } from '../Types/attendanceNew';

const PAGE_SIZES = [5, 10] as const;

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityTrackWithStats[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
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

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await activityTracksApi.getAll(currentPage, pageSize);
      const data = response.data ?? [];
      const tp = Math.max(1, response.totalPages ?? 1);
      const total = response.total ?? 0;

      setActivities(data);
      setTotalPages(tp);
      setTotalCount(total);

      if (data.length === 0 && currentPage > 1) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    } catch {
      setError('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadActivities();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadActivities]);

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
      <AttendancePageHeader
        accent="emerald"
        icon={<FaCalendarAlt className="h-6 w-6" />}
        title="Gestión de actividades"
        description="Crea y edita actividades; el escaneo QR se gestiona desde Escanear QR."
        actions={
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <FaPlus className="h-4 w-4" />
            Nueva actividad
          </button>
        }
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8 ">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'completed' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Actividades</h2>
              {!loading && totalCount > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalCount)} de {totalCount}
                </p>
              )}
            </div>
            {!loading && totalCount > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Por página:
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                    setCurrentPage(1);
                  }}
                  className="min-h-[44px] rounded-lg border border-gray-300 px-2 py-1.5 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {loading && !showCreateForm ? (
            <div className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600">Cargando actividades...</span>
              </div>
            </div>
          ) : !loading && totalCount === 0 ? (
            <div className="p-6 text-center">
              <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
              <p className="text-gray-600 mb-4">Crea tu primera actividad para comenzar a gestionar la asistencia.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                Crear Primera Actividad
              </button>
            </div>
          ) : (
            <>
              <ul className="md:hidden">
                {activities.map((activity) => (
                  <li key={activity.id} className="border-b border-gray-100 px-4 py-4 last:border-b-0">
                    <article className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="break-words text-base font-semibold leading-snug text-gray-900">
                            {activity.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(activity.status || 'inactive')}`}
                            >
                              {getStatusText(activity.status || 'inactive')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span className="font-medium text-gray-800">
                            {new Date(activity.event_date).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {activity.event_time && (
                            <span>{activity.event_time.slice(0, 5)}</span>
                          )}
                          {activity.location && (
                            <span className="w-full text-gray-500 sm:w-auto">{activity.location}</span>
                          )}
                        </div>

                        {activity.description && (
                          <p className="line-clamp-2 text-sm text-gray-500">
                            {activity.description.length > 120
                              ? `${activity.description.slice(0, 120)}…`
                              : activity.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-200/80 pt-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {activity.total_attendance || 0}{' '}
                            <span className="font-normal text-gray-600">asistentes</span>
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to="/admin/attendance/beneficiaries"
                              search={{ activityId: activity.id }}
                              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              <FaEye className="h-4 w-4 shrink-0" aria-hidden />
                              Asistencia
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditForm(activity)}
                              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              <FaEdit className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                              Editar
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteActivity(activity.id!)}
                            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <FaTrash className="h-4 w-4 shrink-0" aria-hidden />
                            Eliminar actividad
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actividad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Asistencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="whitespace-wrap px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                            {activity.description && (
                              <div className="max-w-xs break-words text-sm text-gray-500">
                                {activity.description.length > 100
                                  ? `${activity.description.slice(0, 100)}…`
                                  : activity.description}
                              </div>
                            )}
                            {activity.location && (
                              <div className="text-sm text-gray-500">{activity.location}</div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(activity.event_date).toLocaleDateString('es-ES')}
                          </div>
                          {activity.event_time && (
                            <div className="text-sm text-gray-500">{activity.event_time.slice(0, 5)}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(activity.status || 'inactive')}`}
                          >
                            {getStatusText(activity.status || 'inactive')}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {activity.total_attendance || 0} asistentes
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to="/admin/attendance/beneficiaries"
                              search={{ activityId: activity.id }}
                              className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              title="Ver asistencia"
                              aria-label={`Ver asistencia: ${activity.name}`}
                            >
                              <FaEye className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditForm(activity)}
                              className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                              title="Editar"
                              aria-label={`Editar: ${activity.name}`}
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(activity.id!)}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              title="Eliminar"
                              aria-label={`Eliminar: ${activity.name}`}
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-start">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Página anterior"
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                              currentPage === pageNum
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Página siguiente"
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-center text-sm text-gray-600 sm:text-right">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
