import { useState, useEffect, useCallback } from 'react';
import { FaUserFriends, FaCheckCircle, FaExclamationTriangle, FaPlus, FaUsers, FaCar, FaDownload } from 'react-icons/fa';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import ActivitySelector from '../Components/ActivitySelector';
import AttendancePageHeader from '../Components/AttendancePageHeader';
import AttendanceEmptyState from '../Components/AttendanceEmptyState';
import { activityTracksApi, attendanceRecordsApi, parkingRegistrationsApi } from '../Services/attendanceNewApi';
import type { ActivityParkingRegistration, ActivityTrack, AttendanceRecord } from '../Types/attendanceNew';
import { formatParkingRegistrationsAsCsv } from '../utils/parkingCsvExport';

export default function GuestAttendancePage() {
  const remainingChars = (value: string, max: number) => max - value.length;

  const LIMITS = {
    plate: 20,
    fullName: 60,
    cedula: 13,
    phone: 8,
  } as const;

  const navigate = useNavigate();
  const activityIdFromSearch = useRouterState({
    select: (s) => (s.location.search as { activityId?: number }).activityId,
  });
  const [selectedActivity, setSelectedActivity] = useState<ActivityTrack | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [parkingRegistrations, setParkingRegistrations] = useState<ActivityParkingRegistration[]>([]);
  const [parkingLoading, setParkingLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    cedula: '',
    phone: '',
    plate: '',
  });

  const validateGuestForm = (parkingOn: boolean): string | null => {
    const name = formData.full_name.trim();
    const plate = formData.plate.trim();
    const cedula = formData.cedula.trim();
    const phone = formData.phone.trim();

    if (parkingOn) {
      if (!plate) return 'La placa es obligatoria para esta actividad (estacionamiento habilitado).';
      if (plate.length < 2) return 'La placa debe tener al menos 2 caracteres.';
      if (plate.length > LIMITS.plate) return `La placa no puede superar ${LIMITS.plate} caracteres.`;
      if (!/^[A-Za-z0-9\s-]+$/.test(plate)) return 'La placa solo puede contener letras, números, espacios y guiones.';
    } else {
      if (!name) return 'El nombre completo es requerido.';
    }

    if (name.length > LIMITS.fullName) return `El nombre completo no puede superar ${LIMITS.fullName} caracteres.`;
    if (name && !/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/.test(name)) return 'Solo se permiten letras en el nombre completo.';

    if (cedula.length > LIMITS.cedula) return `La cédula no puede tener más de ${LIMITS.cedula} dígitos.`;
    if (cedula && !/^\d+$/.test(cedula)) return 'Solo se permiten números en la cédula.';

    if (phone.length > LIMITS.phone) return `El teléfono no puede tener más de ${LIMITS.phone} dígitos.`;
    if (phone && !/^\d+$/.test(phone)) return 'Solo se permiten números en el teléfono.';

    return null;
  };

  const loadAttendanceRecords = useCallback(async () => {
    if (!selectedActivity) return;
    if (selectedActivity.parking_enabled) {
      setAttendanceRecords([]);
      return;
    }

    try {
      setLoading(true);
      const records = await attendanceRecordsApi.getByActivityTrack(selectedActivity.id!);
      setAttendanceRecords(records.data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar registros de asistencia');
    } finally {
      setLoading(false);
    }
  }, [selectedActivity]);

  useEffect(() => {
    if (selectedActivity && !selectedActivity.parking_enabled) {
      const timer = setTimeout(() => {
        loadAttendanceRecords();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [selectedActivity, loadAttendanceRecords]);

  const loadParkingRegistrations = useCallback(async () => {
    if (!selectedActivity?.id || !selectedActivity.parking_enabled) {
      setParkingRegistrations([]);
      return;
    }
    try {
      setParkingLoading(true);
      const rows = await parkingRegistrationsApi.listByActivity(selectedActivity.id);
      setParkingRegistrations(rows);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar registros de estacionamiento');
    } finally {
      setParkingLoading(false);
    }
  }, [selectedActivity]);

  useEffect(() => {
    if (!selectedActivity?.parking_enabled) {
      setParkingRegistrations([]);
      return;
    }
    const timer = setTimeout(() => {
      void loadParkingRegistrations();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedActivity, loadParkingRegistrations]);

  const handleActivitySelect = useCallback((activity: ActivityTrack) => {
    setSelectedActivity(activity);
    setError(null);
    setSuccess(null);
    setFormData({ full_name: '', cedula: '', phone: '', plate: '' });
  }, []);

  useEffect(() => {
    const id = activityIdFromSearch;
    if (id == null) return;
    let cancelled = false;
    void activityTracksApi
      .getById(id)
      .then((track) => {
        if (cancelled) return;
        handleActivitySelect(track);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo cargar la actividad desde el enlace');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activityIdFromSearch, handleActivitySelect]);

  const exportParkingCsv = () => {
    if (!selectedActivity?.name || parkingRegistrations.length === 0) return;
    const safeName = selectedActivity.name.replace(/[^\w\s-]/g, '').slice(0, 60) || 'actividad';
    const dateStamp = new Date().toISOString().split('T')[0];
    const csv = formatParkingRegistrationsAsCsv(parkingRegistrations);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estacionamiento_${safeName}_${dateStamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setSuccess(`${parkingRegistrations.length} registro(s) de estacionamiento exportado(s)`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivity) {
      setError('Por favor selecciona una actividad primero');
      return;
    }

    const parking = !!selectedActivity.parking_enabled;
    const validationError = validateGuestForm(parking);
    if (validationError) {
      setError(validationError);
      return;
    }
    const name = formData.full_name.trim();
    const plate = formData.plate.trim();

    try {
      setLoading(true);
      setError(null);

      if (parking) {
        await parkingRegistrationsApi.createAdmin(selectedActivity.id!, {
          plate,
          full_name: name || undefined,
          cedula: formData.cedula.trim() || undefined,
          phone: formData.phone.trim() || undefined,
        });
        await loadParkingRegistrations();
      } else {
        await attendanceRecordsApi.createManual({
          activity_track_id: selectedActivity.id!,
          attendance_type: 'guest',
          full_name: name,
          cedula: formData.cedula.trim() || undefined,
          phone: formData.phone.trim() || undefined,
        });
        await loadAttendanceRecords();
      }

      const parts: string[] = [];
      if (parking) parts.push(`Vehículo: ${plate}`);
      else parts.push(name ? `Persona: ${name}` : '');

      setSuccess(parts.filter(Boolean).join(' · ') || 'Registro guardado');
      setFormData({ full_name: '', cedula: '', phone: '', plate: '' });
      setShowForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const getGuestsCount = () => {
    return attendanceRecords.filter((record) => record.attendance_type === 'guest').length;
  };

  const getBeneficiariosCount = () => {
    return attendanceRecords.filter((record) => record.attendance_type === 'beneficiario').length;
  };

  const parkingOn = !!selectedActivity?.parking_enabled;

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="emerald"
        icon={<FaUserFriends className="h-6 w-6" />}
        title="Registro manual"
        description={
          selectedActivity?.parking_enabled
            ? 'Registro de vehículos para esta actividad (estacionamiento).'
            : 'Registra invitados para la actividad seleccionada.'
        }
        actions={
          selectedActivity ? (
            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Actividad</p>
                <p className="max-w-[200px] truncate font-medium text-gray-900 lg:max-w-xs">
                  {selectedActivity.name}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-900">Activa</span>
              </div>
            </div>
          ) : null
        }
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1">
            <ActivitySelector
              onActivitySelect={handleActivitySelect}
              selectedActivity={selectedActivity || undefined}
              showCreateButton={true}
              onCreateActivity={() => {
                navigate({ to: '../activities' as string });
              }}
            />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-green-800">{success}</p>
                </div>
              </div>
            )}

            {!selectedActivity && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <AttendanceEmptyState
                  className="border-0 shadow-none sm:p-6"
                  icon={<FaUserFriends className="h-7 w-7" />}
                  title="Selecciona una actividad"
                  description="Para registrar invitados o placas, elige una actividad en el panel izquierdo."
                />
              </div>
            )}

            {selectedActivity && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {parkingOn ? 'Registro de estacionamiento' : 'Registro'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    {showForm ? 'Cancelar' : 'Nuevo Registro'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {parkingOn && (
                      <div>
                        <label htmlFor="plate" className="mb-1 block text-sm font-medium text-gray-700">
                          Placa del vehículo *
                        </label>
                        <input
                          type="text"
                          id="plate"
                          value={formData.plate}
                          onChange={(e) => {
                            setFormData({ ...formData, plate: e.target.value });
                            setError(null);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                          placeholder="Ej: ABC123"
                          maxLength={LIMITS.plate}
                          required={parkingOn}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {formData.plate.length}/{LIMITS.plate} caracteres ({remainingChars(formData.plate, LIMITS.plate)} restantes)
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Obligatoria cuando la actividad tiene estacionamiento. Una fila por vehículo.
                        </p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-gray-700">
                        Nombre completo{parkingOn ? ' (opcional si solo registras el vehículo)' : ' *'}
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) {
                            setFormData({ ...formData, full_name: value });
                            setError(null);
                          } else {
                            setError(' Solo se permiten letras en el nombre completo');
                          }
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ej: Juan Pérez"
                        required={!parkingOn}
                        maxLength={LIMITS.fullName}
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        {formData.full_name.length}/{LIMITS.fullName} caracteres ({remainingChars(formData.full_name, LIMITS.fullName)} restantes)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="cedula" className="mb-1 block text-sm font-medium text-gray-700">
                          Cédula (opcional)
                        </label>
                        <input
                          type="text"
                          id="cedula"
                          value={formData.cedula}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!/^\d*$/.test(value)) {
                              setError(' Solo se permiten números en la cédula');
                            } else if (value.length > 15) {
                              setError(' La cédula no puede tener más de 15 dígitos');
                            } else {
                              setFormData({ ...formData, cedula: value });
                              setError(null);
                            }
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                          placeholder="Ej: 12345678"
                          maxLength={LIMITS.cedula}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {formData.cedula.length}/{LIMITS.cedula} caracteres ({remainingChars(formData.cedula, LIMITS.cedula)} restantes)
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                          Teléfono (opcional)
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!/^\d*$/.test(value)) {
                              setError(' Solo se permiten números en el teléfono');
                            } else if (value.length > 15) {
                              setError('El teléfono no puede tener más de 15 dígitos');
                            } else {
                              setFormData({ ...formData, phone: value });
                              setError(null);
                            }
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                          placeholder="Ej: 5551234"
                          maxLength={LIMITS.phone}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {formData.phone.length}/{LIMITS.phone} caracteres ({remainingChars(formData.phone, LIMITS.phone)} restantes)
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Registrando…
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="h-4 w-4" />
                            {parkingOn ? 'Guardar registro' : 'Registrar persona'}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {parkingOn && (
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <FaCar className="h-4 w-4 text-amber-700" aria-hidden />
                        Vehículos registrados
                      </h3>
                      {!parkingLoading && parkingRegistrations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => exportParkingCsv()}
                          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          <FaDownload className="h-4 w-4" aria-hidden />
                          Exportar Excel (CSV)
                        </button>
                      )}
                    </div>
                    {parkingLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        Cargando…
                      </div>
                    ) : parkingRegistrations.length === 0 ? (
                      <p className="text-sm text-gray-500">Ningún vehículo aún. Usa «Nuevo Registro» y la placa arriba.</p>
                    ) : (
                      <div className="max-h-56 space-y-2 overflow-y-auto">
                        {parkingRegistrations.map((reg) => (
                          <div
                            key={reg.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">{reg.plate_raw}</p>
                              <p className="text-xs text-gray-600">
                                {[reg.full_name, reg.cedula ? `ID ${reg.cedula}` : null, reg.phone ? `Tel ${reg.phone}` : null]
                                  .filter(Boolean)
                                  .join(' · ') || 'Sin contacto en estacionamiento'}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {reg.source === 'admin' ? 'Admin' : 'Público'}
                              {reg.created_at ? ` · ${new Date(reg.created_at).toLocaleString('es-ES')}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedActivity && !parkingOn && !loading && attendanceRecords.length === 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <AttendanceEmptyState
                  className="border-0 shadow-none sm:p-6"
                  icon={<FaUsers className="h-7 w-7" />}
                  title="Aún no hay registros de asistencia"
                  description="Registra invitados con el formulario para verlos en esta lista."
                />
              </div>
            )}

            {selectedActivity && !parkingOn && attendanceRecords.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Registros de asistencia</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUsers className="h-4 w-4 text-emerald-600" />
                      <span className="text-gray-600">{getBeneficiariosCount()} beneficiarios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUserFriends className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">{getGuestsCount()} invitados</span>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {attendanceRecords.map((record) => {
                    const isBeneficiario = record.attendance_type === 'beneficiario';

                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${isBeneficiario ? 'bg-emerald-100' : 'bg-gray-100'}`}
                          >
                            {isBeneficiario ? (
                              <FaUsers className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <FaUserFriends className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{record.full_name}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              {record.cedula && <span>Cédula: {record.cedula}</span>}
                              {record.phone && <span>Tel: {record.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {record.created_at && new Date(record.created_at).toLocaleString('es-ES')}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              isBeneficiario ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {isBeneficiario ? 'Beneficiario' : 'Invitado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {loading && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  <span className="ml-3 text-gray-600">Procesando…</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
