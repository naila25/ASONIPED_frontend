import { useState, useEffect, useCallback, useRef } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaEye, FaChevronLeft, FaChevronRight, FaCar, FaCopy, FaArchive, FaUndo, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
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
  const [showArchived, setShowArchived] = useState(false);
  const [archiveConfirmForId, setArchiveConfirmForId] = useState<number | null>(null);
  const [deleteConfirmForId, setDeleteConfirmForId] = useState<number | null>(null);
  const [parkingModalActivity, setParkingModalActivity] = useState<ActivityTrackWithStats | null>(null);
  const [parkingModalLoading, setParkingModalLoading] = useState(false);
  const [parkingModalPayload, setParkingModalPayload] = useState<{ url: string; expiresAt: string } | null>(null);
  const [parkingModalError, setParkingModalError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const prevDebouncedSearchRef = useRef<string | null>(null);

  const isActivityArchived = (a: ActivityTrackWithStats) => !!(a.archived ?? false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    parking_enabled: false,
  });

  const openParkingModal = async (activity: ActivityTrackWithStats) => {
    setParkingModalActivity(activity);
    setParkingModalPayload(null);
    setParkingModalError(null);
    setParkingModalLoading(true);
    try {
      const res = await activityTracksApi.getParkingPublicLink(activity.id!);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setParkingModalPayload({
        url: `${origin}/estacionamiento/${encodeURIComponent(res.token)}`,
        expiresAt: res.expiresAt,
      });
    } catch (e: unknown) {
      setParkingModalError((e as Error).message || 'Error al cargar el enlace');
    } finally {
      setParkingModalLoading(false);
    }
  };

  const closeParkingModal = () => {
    setParkingModalActivity(null);
    setParkingModalPayload(null);
    setParkingModalError(null);
    setParkingModalLoading(false);
  };

  const copyParkingUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setError(null);
      setSuccess('Enlace copiado');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setSuccess(null);
      setError('No se pudo copiar al portapapeles');
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchDraft.trim()), 400);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const searchChanged =
        prevDebouncedSearchRef.current !== null &&
        prevDebouncedSearchRef.current !== debouncedSearch;
      const pageToUse = searchChanged ? 1 : currentPage;
      prevDebouncedSearchRef.current = debouncedSearch;
      if (searchChanged) {
        setCurrentPage(1);
      }

      const response = await activityTracksApi.getAll(
        pageToUse,
        pageSize,
        undefined,
        undefined,
        showArchived,
        debouncedSearch || undefined
      );
      const data = response.data ?? [];
      const tp = Math.max(1, response.totalPages ?? 1);
      const total = response.total ?? 0;

      setActivities(data);
      setTotalPages(tp);
      setTotalCount(total);

      if (data.length === 0 && pageToUse > 1) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    } catch {
      setError('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, showArchived, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadActivities();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadActivities]);

  useEffect(() => {
    if (archiveConfirmForId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setArchiveConfirmForId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [archiveConfirmForId]);

  useEffect(() => {
    if (deleteConfirmForId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeleteConfirmForId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleteConfirmForId]);

  useEffect(() => {
    if (parkingModalActivity === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setParkingModalActivity(null);
        setParkingModalPayload(null);
        setParkingModalError(null);
        setParkingModalLoading(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [parkingModalActivity]);

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
        status: 'active',
        parking_enabled: formData.parking_enabled,
      });

      setSuccess('Actividad creada exitosamente');
      setFormData({
        name: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        parking_enabled: false,
      });
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
        status: editingActivity.status || 'active',
        parking_enabled: formData.parking_enabled,
      });

      setSuccess('Actividad actualizada exitosamente');
      setEditingActivity(null);
      setFormData({
        name: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        parking_enabled: false,
      });
      await loadActivities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al actualizar actividad');
    } finally {
      setLoading(false);
    }
  };

  const performArchiveActivity = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      await activityTracksApi.archive(id);
      setSuccess('Actividad archivada');
      await loadActivities();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al archivar actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchiveActivity = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      await activityTracksApi.unarchive(id);
      setSuccess('Actividad restaurada');
      await loadActivities();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al restaurar actividad');
    } finally {
      setLoading(false);
    }
  };

  const performDeleteActivity = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await activityTracksApi.delete(id);
      setDeleteConfirmForId(null);
      setSuccess('Actividad eliminada del sistema');
      await loadActivities();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al eliminar la actividad');
    } finally {
      setLoading(false);
    }
  };

  const toDateInputValue = (value: string) => {
    if (!value) return '';
    // Accept ISO strings, "YYYY-MM-DD HH:MM:SS", or already-normalized YYYY-MM-DD
    const datePart = value.includes('T') ? value.split('T')[0] : value.split(' ')[0];
    const isoMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return datePart;
    // Accept common "M/D/YYYY" or "MM/DD/YYYY" formats
    if (value.includes('/')) {
      const [mStr, dStr, yStr] = value.split('/');
      const y = Number(yStr);
      const m = Number(mStr);
      const d = Number(dStr);
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        const mm = String(m).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      }
    }
    // Last resort: try Date parsing and normalize
    const dt = new Date(value);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  const openEditForm = (activity: ActivityTrack) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || '',
      event_date: toDateInputValue(activity.event_date),
      event_time: activity.event_time || '',
      location: activity.location || '',
      parking_enabled: !!activity.parking_enabled,
    });
    setShowCreateForm(true);
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingActivity(null);
    setFormData({
      name: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      parking_enabled: false,
    });
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
        description="Crea y edita actividades. Archivar oculta sin borrar; desde archivar o actividades archivadas puedes eliminar permanentemente si lo necesitas."
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
        {archiveConfirmForId !== null && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-dialog-title"
            onClick={() => setArchiveConfirmForId(null)}
          >
            <div
              className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="archive-dialog-title" className="text-lg font-semibold text-gray-900">
                Archivar actividad
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                ¿Archivar esta actividad? Dejará de mostrarse en listas y enlaces públicos; los datos se conservan.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setArchiveConfirmForId(null)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = archiveConfirmForId;
                    setArchiveConfirmForId(null);
                    void performArchiveActivity(id!);
                  }}
                  disabled={loading}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-50"
                >
                  Archivar
                </button>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">
                  Si en cambio quieres borrarla del sistema (asistencia, estacionamiento y todo lo asociado):
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const id = archiveConfirmForId;
                    setArchiveConfirmForId(null);
                    setDeleteConfirmForId(id);
                  }}
                  disabled={loading}
                  className="mt-3 inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                >
                  <FaTrash className="h-4 w-4 shrink-0" aria-hidden />
                  Eliminar permanentemente…
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmForId !== null && (
          <div
            className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            onClick={() => setDeleteConfirmForId(null)}
          >
            <div
              className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="delete-dialog-title" className="text-lg font-semibold text-red-900">
                Eliminar actividad
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                Se eliminará esta actividad y los datos relacionados (registros de asistencia, estacionamiento, etc.).
                Esta acción <strong>no se puede deshacer</strong>.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmForId(null)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deleteConfirmForId;
                    void performDeleteActivity(id!);
                  }}
                  disabled={loading}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                >
                  <FaTrash className="h-4 w-4 shrink-0" aria-hidden />
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {parkingModalActivity !== null && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parking-dialog-title"
            onClick={() => closeParkingModal()}
          >
            <div
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border  bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="parking-dialog-title" className="text-lg font-semibold text-gray-900">
                    Estacionamiento público
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{parkingModalActivity.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => closeParkingModal()}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label="Cerrar"
                >
                  <FaTimes className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                El enlace público caduca cada <strong>6 horas</strong> y se renueva automáticamente. Vuelve a abrir
                este cuadro para obtener el enlace y el QR vigentes.
              </p>

              {parkingModalLoading && (
                <div className="mt-8 flex items-center justify-center gap-3 py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-600" />
                  <span className="text-sm text-gray-600">Generando enlace…</span>
                </div>
              )}

              {!parkingModalLoading && parkingModalError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {parkingModalError}
                  <button
                    type="button"
                    onClick={() => void openParkingModal(parkingModalActivity)}
                    className="mt-3 text-sm font-medium text-red-900 underline hover:no-underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!parkingModalLoading && parkingModalPayload && (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-col items-center gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-6">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
                        parkingModalPayload.url
                      )}`}
                      alt="Código QR del enlace de estacionamiento"
                      className="h-[min(280px,70vw)] w-[min(280px,70vw)] max-w-full rounded-lg border border-amber-200 bg-white p-2"
                    />
                    <p className="text-center text-xs text-amber-900/90">
                      Válido hasta{' '}
                      <time dateTime={parkingModalPayload.expiresAt}>
                        {new Date(parkingModalPayload.expiresAt).toLocaleString('es-ES', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                      Enlace
                    </label>
                    <p className="break-all rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                      {parkingModalPayload.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyParkingUrl(parkingModalPayload.url)}
                    className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <FaCopy className="h-4 w-4" aria-hidden />
                    Copiar enlace
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showCreateForm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 bg-black/50 
">
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

                <div className="rounded-lg border border-amber-100 bg-amber-50/80 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.parking_enabled}
                      onChange={(e) => setFormData({ ...formData, parking_enabled: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">Estacionamiento</span>
                      <span className="mt-0.5 block text-sm text-gray-600">
                        Enlace público para registrar placas (una por vehículo por actividad). El QR apunta solo a la URL.
                      </span>
                    </span>
                  </label>
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
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="relative w-full sm:max-w-xl">
              <label htmlFor="activity-search" className="sr-only">
                Buscar actividades
              </label>
              <FaSearch
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                id="activity-search"
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Buscar por nombre, descripción o ubicación…"
                autoComplete="off"
                className="w-full min-h-[44px] rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchDraft ? (
                <button
                  type="button"
                  onClick={() => setSearchDraft('')}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label="Limpiar búsqueda"
                >
                  <FaTimes className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Actividades</h2>
              {!loading && totalCount > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalCount)} de {totalCount}
                </p>
              )}
            </div>
            {!loading && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => {
                      setShowArchived(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Mostrar archivadas
                </label>
                {totalCount > 0 && (
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
            )}
            </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {debouncedSearch
                  ? 'Sin resultados'
                  : showArchived
                    ? 'No hay actividades archivadas'
                    : 'No hay actividades'}
              </h3>
              <p className="text-gray-600 mb-4">
                {debouncedSearch
                  ? 'Prueba con otras palabras o revisa que «Mostrar archivadas» coincida con lo que buscas.'
                  : showArchived
                    ? 'No hay elementos en el archivo.'
                    : 'Crea tu primera actividad para comenzar a gestionar la asistencia. Si solo ves vacío porque todo está archivado, activa «Mostrar archivadas» arriba.'}
              </p>
              {!showArchived && !debouncedSearch && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                  Crear Primera Actividad
                </button>
              )}
            </div>
          ) : (
            <>
              <ul className="md:hidden">
                {activities.map((activity) => (
                  <li key={activity.id} className="border-b border-gray-100 px-4 py-4 last:border-b-0">
                    <article
                      className={`rounded-xl border border-gray-200 bg-gray-50/60 p-4 ${isActivityArchived(activity) ? 'opacity-80' : ''}`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="break-words text-base font-semibold leading-snug text-gray-900">
                            {activity.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {isActivityArchived(activity) && (
                              <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                Archivada
                              </span>
                            )}
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
                        
                        {!!activity.parking_enabled && activity.parking_public_token && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm">
                            <div className="flex items-center gap-2 font-medium text-amber-900">
                              <FaCar className="h-4 w-4 shrink-0" aria-hidden />
                              Estacionamiento
                            </div>
                            {isActivityArchived(activity) ? (
                              <p className="mt-1 text-xs text-amber-900/80">
                                Enlace desactivado mientras la actividad esté archivada.
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void openParkingModal(activity)}
                                className="mt-2 inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                              >
                                <FaCopy className="h-4 w-4 shrink-0" aria-hidden />
                                Ver enlace y código QR
                              </button>
                            )}
                          </div>
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
                              to={
                                activity.parking_enabled
                                  ? '/admin/attendance/guests'
                                  : '/admin/attendance/beneficiaries'
                              }
                              search={{ activityId: activity.id }}
                              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              <FaEye className="h-4 w-4 shrink-0" aria-hidden />
                              {activity.parking_enabled ? 'Registro manual' : 'Asistencia'}
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditForm(activity)}
                              disabled={isActivityArchived(activity)}
                              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FaEdit className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                              Editar
                            </button>
                          </div>
                          {isActivityArchived(activity) ? (
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => handleUnarchiveActivity(activity.id!)}
                                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                <FaUndo className="h-4 w-4 shrink-0" aria-hidden />
                                Restaurar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmForId(activity.id!)}
                                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-800 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              >
                                <FaTrash className="h-4 w-4 shrink-0" aria-hidden />
                                Eliminar del sistema
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setArchiveConfirmForId(activity.id!)}
                              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            >
                              <FaArchive className="h-4 w-4 shrink-0" aria-hidden />
                              Archivar
                            </button>
                          )}
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
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        title="Enlace público con caducidad de 6 horas; ábrelo desde el botón para ver QR y copiar."
                      >
                        Estacionamiento
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
                      <tr
                        key={activity.id}
                        className={`hover:bg-gray-50 ${isActivityArchived(activity) ? 'opacity-80' : ''}`}
                      >
                        <td className="whitespace-wrap px-6 py-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{activity.name}</span>
                              {isActivityArchived(activity) && (
                                <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-800">
                                  Archivada
                                </span>
                              )}
                            </div>
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
                        <td className="whitespace-nowrap px-6 py-4">
                          {!!activity.parking_enabled && activity.parking_public_token ? (
                            isActivityArchived(activity) ? (
                              <span className="text-sm text-gray-500" title="Archivada">
                                —
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void openParkingModal(activity)}
                                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                title="Ver enlace y código QR (válido 6 h)"
                                aria-label={`Enlace de estacionamiento: ${activity.name}`}
                              >
                                <FaCar className="h-4 w-4 shrink-0" aria-hidden />
                                QR / enlace
                              </button>
                            )
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {activity.total_attendance || 0} asistentes
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={
                                activity.parking_enabled
                                  ? '/admin/attendance/guests'
                                  : '/admin/attendance/beneficiaries'
                              }
                              search={{ activityId: activity.id }}
                              className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              title={
                                activity.parking_enabled
                                  ? 'Registro manual (estacionamiento)'
                                  : 'Ver asistencia'
                              }
                              aria-label={
                                activity.parking_enabled
                                  ? `Registro manual: ${activity.name}`
                                  : `Ver asistencia: ${activity.name}`
                              }
                            >
                              <FaEye className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditForm(activity)}
                              disabled={isActivityArchived(activity)}
                              className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                              title="Editar"
                              aria-label={`Editar: ${activity.name}`}
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            {isActivityArchived(activity) ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUnarchiveActivity(activity.id!)}
                                  className="rounded-lg p-2 text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                  title="Restaurar"
                                  aria-label={`Restaurar: ${activity.name}`}
                                >
                                  <FaUndo className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmForId(activity.id!)}
                                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                  title="Eliminar permanentemente"
                                  aria-label={`Eliminar: ${activity.name}`}
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setArchiveConfirmForId(activity.id!)}
                                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                title="Archivar"
                                aria-label={`Archivar: ${activity.name}`}
                              >
                                <FaArchive className="h-4 w-4" />
                              </button>
                            )}
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
