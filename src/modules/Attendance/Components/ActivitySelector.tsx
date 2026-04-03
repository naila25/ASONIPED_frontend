import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPlay,
  FaStop,
  FaPlus,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaChevronDown,
  FaSearch,
} from 'react-icons/fa';
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
  const [scanActionError, setScanActionError] = useState<string | null>(null);
  /** Mobile: lista de actividades en modal / bottom sheet */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');

  useEffect(() => {
    fetchActivities();
    checkScanningStatus();
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) {
      setMobileSearch('');
    }
  }, [pickerOpen]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityTracksApi.getAll(1, 50, 'active');
      setActivities(response.data);
    } catch {
      setError('Error al cargar las actividades');
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
    } catch {
      // Optional: UI works without active-scanning state if this request fails
    }
  };

  const handleStartScanning = async (activityId: number) => {
    setScanActionError(null);
    try {
      await activityTracksApi.startScanning(activityId);
      setScanningStatus({ [activityId]: true });
      if (selectedActivity?.id === activityId) {
        const updatedActivity = { ...selectedActivity, scanning_active: true };
        onActivitySelect(updatedActivity);
      }
    } catch {
      setScanActionError('No se pudo iniciar el escaneo. Intenta de nuevo.');
    }
  };

  const handleStopScanning = async (activityId: number) => {
    setScanActionError(null);
    try {
      await activityTracksApi.stopScanning(activityId);
      setScanningStatus({ [activityId]: false });
      if (selectedActivity?.id === activityId) {
        const updatedActivity = { ...selectedActivity, scanning_active: false };
        onActivitySelect(updatedActivity);
      }
    } catch {
      setScanActionError('No se pudo detener el escaneo. Intenta de nuevo.');
    }
  };

  /** Compact date for dense list rows (e.g. sáb, 11 oct 2025). */
  const formatDateCompact = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /** Minimal date for mobile one-liner (e.g. 11 oct · año si hace falta). */
  const formatDateMinimal = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const currentY = new Date().getFullYear();
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      ...(y !== currentY ? { year: 'numeric' as const } : {}),
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="animate-pulse">
          <div className="mb-3 h-4 w-36 rounded bg-gray-200 md:mb-3 md:w-40" />
          <div className="h-14 rounded-lg bg-gray-200 md:hidden" />
          <div className="hidden space-y-2.5 md:block">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="text-center">
          <FaTimes className="mx-auto mb-3 h-11 w-11 text-red-500 md:mb-4 md:h-12 md:w-12" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar actividades</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchActivities}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const selectedMobileMeta =
    selectedActivity &&
    [
      formatDateMinimal(selectedActivity.event_date),
      selectedActivity.event_time ? formatTime(selectedActivity.event_time) : null,
      selectedActivity.location || null,
    ]
      .filter(Boolean)
      .join(' · ');

  const selectedIsScanning = selectedActivity
    ? Boolean(scanningStatus[selectedActivity.id!] ?? selectedActivity.scanning_active)
    : false;
  const mobileSearchValue = mobileSearch.trim().toLowerCase();
  const filteredForMobile = activities.filter((activity) => {
    if (!mobileSearchValue) return true;
    const searchText = [
      activity.name,
      activity.description || '',
      activity.location || '',
      formatDateMinimal(activity.event_date),
      activity.event_time ? formatTime(activity.event_time) : '',
    ]
      .join(' ')
      .toLowerCase();
    return searchText.includes(mobileSearchValue);
  });

  return (
    <>
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <section aria-labelledby="attendance-activity-context-heading" className="border-b border-gray-100 pb-3 md:pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h2
              id="attendance-activity-context-heading"
              className="text-base font-semibold text-gray-900 md:text-lg"
            >
              Elegir actividad
            </h2>
            <p className="mt-1 hidden text-sm text-gray-500 md:block">
              Elige una actividad en la lista. El escaneo QR se inicia o detiene con los botones a la derecha.
            </p>
            <p className="mt-1 text-xs leading-snug text-gray-500 md:hidden">
              Abre el selector para elegir una actividad; luego verás solo la que elegiste.
            </p>
          </div>
          {showCreateButton && onCreateActivity && (
            <button
              type="button"
              onClick={onCreateActivity}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-stretch rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:self-auto md:px-4 md:py-2.5 md:text-base"
            >
              <FaPlus className="h-4 w-4 md:h-[18px] md:w-[18px]" />
              <span className="md:hidden">Actividades</span>
              <span className="hidden md:inline">Ir a actividades</span>
            </button>
          )}
        </div>
      </section>

      <section aria-label="Actividades disponibles" className="mt-4 md:mt-5">
        <h3 className="mb-2 hidden text-xs font-semibold uppercase tracking-wide text-gray-500 md:mb-3 md:block">
          Actividades disponibles
        </h3>

        {scanActionError && (
          <div
            className="mb-3 flex items-start justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 md:mb-4 md:gap-3 md:px-4 md:py-3"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
              <span>{scanActionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setScanActionError(null)}
              className="shrink-0 rounded-lg p-1 text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Cerrar mensaje"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        )}

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades activas</h3>
          <p className="text-gray-600 mb-4">Crea una nueva actividad para comenzar a gestionar la asistencia</p>
          {showCreateButton && onCreateActivity && (
            <button
              type="button"
              onClick={onCreateActivity}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <FaPlus className="h-4 w-4" />
              Crear primera actividad
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Móvil: selector compacto + modal; no lista larga en pantalla */}
          <div className="md:hidden">
            {selectedActivity ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-gray-900">{selectedActivity.name}</p>
                    {selectedMobileMeta ? (
                      <p className="mt-1 truncate text-xs text-gray-600">{selectedMobileMeta}</p>
                    ) : null}
                    {selectedIsScanning && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" aria-hidden />
                        Escaneo activo
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {selectedActivity.status === 'active' &&
                      (!selectedIsScanning ? (
                        <button
                          type="button"
                          onClick={() => handleStartScanning(selectedActivity.id!)}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-emerald-700 transition-colors active:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          title="Iniciar escaneo QR"
                          aria-label="Iniciar escaneo QR"
                        >
                          <FaPlay className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStopScanning(selectedActivity.id!)}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-600 transition-colors active:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          title="Detener escaneo QR"
                          aria-label="Detener escaneo QR"
                        >
                          <FaStop className="h-5 w-5" />
                        </button>
                      ))}
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-medium text-emerald-900 shadow-sm transition-colors active:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      Cambiar
                      <FaChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex w-full min-h-[52px] items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 px-4 text-base font-medium text-gray-800 transition-colors active:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <FaChevronDown className="h-5 w-5 text-emerald-600" aria-hidden />
                Elegir actividad
              </button>
            )}
          </div>

          {/* Tablet / escritorio: lista inline */}
          <div className="hidden space-y-2.5 md:block">
          {activities.map((activity) => {
            const isSelected = selectedActivity?.id === activity.id;
            const isScanning = scanningStatus[activity.id!];

            return (
              <div
                key={activity.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                title={activity.description || undefined}
                className={`cursor-pointer rounded-xl border px-4 py-3 transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500/15'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80'
                }`}
                onClick={() => onActivitySelect(activity)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onActivitySelect(activity);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      {isSelected && (
                        <span
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                          aria-label="Seleccionada"
                        >
                          <FaCheck className="h-3 w-3" aria-hidden />
                        </span>
                      )}
                      <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
                        {activity.name}
                      </h3>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(activity.status)}`}
                      >
                        {getStatusText(activity.status)}
                      </span>
                      {isScanning && (
                        <span
                          className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 p-1.5"
                          title="Escaneo QR activo"
                          aria-label="Escaneo QR activo"
                        >
                          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" aria-hidden />
                        </span>
                      )}
                    </div>

                    {activity.description ? (
                      <p className="mt-1 line-clamp-1 text-sm leading-snug text-gray-500">
                        {activity.description}
                      </p>
                    ) : null}

                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-snug text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <FaCalendarAlt className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                        <span className="truncate">{formatDateCompact(activity.event_date)}</span>
                      </span>
                      {activity.event_time ? (
                        <>
                          <span className="text-gray-300" aria-hidden>
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FaClock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                            {formatTime(activity.event_time)}
                          </span>
                        </>
                      ) : null}
                      {activity.location ? (
                        <>
                          <span className="text-gray-300" aria-hidden>
                            ·
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <FaMapMarkerAlt className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                            <span className="truncate">{activity.location}</span>
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  {activity.status === 'active' && (
                    <div className="flex shrink-0">
                      {!isScanning ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartScanning(activity.id!);
                          }}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          title="Iniciar escaneo QR"
                          aria-label="Iniciar escaneo QR"
                        >
                          <FaPlay className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStopScanning(activity.id!);
                          }}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          title="Detener escaneo QR"
                          aria-label="Detener escaneo QR"
                        >
                          <FaStop className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
      </section>

      {selectedActivity && (
        <section
          aria-label="Resumen de actividad seleccionada"
          className="mt-4 hidden border-t border-gray-200 pt-4 md:mt-5 md:block md:pt-5"
        >
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/90 px-3 py-3 md:px-4 md:py-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
              Seleccionada
            </h4>
            <p className="mt-1 text-sm font-medium text-gray-900 md:text-base">{selectedActivity.name}</p>
            {selectedActivity.scanning_active && (
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-800 md:mt-3">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
                <span className="leading-snug">Escaneo QR activo</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>

    {pickerOpen &&
      typeof document !== 'undefined' &&
      createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-label="Cerrar lista de actividades"
            onClick={() => setPickerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-picker-title"
            className="absolute bottom-0 left-0 right-0 flex max-h-[min(90dvh,680px)] flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4">
              <h3 id="activity-picker-title" className="text-lg font-semibold text-gray-900">
                Elegir actividad
              </h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Cerrar"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="border-b border-gray-100 px-3 py-2.5">
              <label htmlFor="mobile-activity-search" className="sr-only">
                Buscar actividad
              </label>
              <div className="relative">
                <FaSearch
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  id="mobile-activity-search"
                  type="text"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Buscar actividad..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {filteredForMobile.map((activity) => {
                const picked = selectedActivity?.id === activity.id;
                const rowMeta = [
                  formatDateMinimal(activity.event_date),
                  activity.event_time ? formatTime(activity.event_time) : null,
                  activity.location || null,
                ]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <li key={activity.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      type="button"
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-4 text-left transition-colors ${
                        picked ? 'bg-emerald-50' : 'active:bg-gray-50'
                      }`}
                      onClick={() => {
                        onActivitySelect(activity);
                        setPickerOpen(false);
                      }}
                    >
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                        {picked ? <FaCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold text-gray-900">{activity.name}</span>
                        <span className="mt-1 block line-clamp-2 text-sm text-gray-500">{rowMeta}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {filteredForMobile.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-gray-500">
                  No se encontraron actividades para "{mobileSearch}".
                </li>
              )}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
