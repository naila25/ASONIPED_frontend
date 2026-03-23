import { useState, useEffect, useCallback } from 'react';
import { FaUserFriends, FaCheckCircle, FaExclamationTriangle, FaPlus, FaUsers } from 'react-icons/fa';
import { useNavigate } from '@tanstack/react-router';
import ActivitySelector from '../Components/ActivitySelector';
import AttendancePageHeader from '../Components/AttendancePageHeader';
import AttendanceEmptyState from '../Components/AttendanceEmptyState';
import { attendanceRecordsApi } from '../Services/attendanceNewApi';
import type { ActivityTrack, AttendanceRecord } from '../Types/attendanceNew';

export default function GuestAttendancePage() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState<ActivityTrack | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    cedula: '',
    phone: '',
  });

  const loadAttendanceRecords = useCallback(async () => {
    if (!selectedActivity) return;

    try {
      setLoading(true);
      // Load ALL attendance records (both beneficiaries and guests)
      const records = await attendanceRecordsApi.getByActivityTrack(selectedActivity.id!);
      setAttendanceRecords(records.data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar registros de asistencia');
    } finally {
      setLoading(false);
    }
  }, [selectedActivity]);

  // Load attendance records when activity is selected
  useEffect(() => {
    if (selectedActivity) {
      // Defer data loading to improve initial render
      const timer = setTimeout(() => {
        loadAttendanceRecords();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [selectedActivity, loadAttendanceRecords]);

  const handleActivitySelect = (activity: ActivityTrack) => {
    setSelectedActivity(activity);
    setError(null);
    setSuccess(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivity) {
      setError('Por favor selecciona una actividad primero');
      return;
    }

    if (!formData.full_name.trim()) {
      setError('El nombre completo es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await attendanceRecordsApi.createManual({
        activity_track_id: selectedActivity.id!,
        attendance_type: 'guest',
        full_name: formData.full_name.trim(),
        cedula: formData.cedula.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      });

      // Reload attendance records
      await loadAttendanceRecords();

      setSuccess(`Invitado registrado: ${formData.full_name}`);
      setFormData({ full_name: '', cedula: '', phone: '' });
      setShowForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al registrar invitado');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        icon={<FaUserFriends className="h-6 w-6" />}
        title="Registro manual"
        description="Registra invitados y consulta la lista de asistencia por actividad."
        actions={
          selectedActivity ? (
            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Actividad</p>
                <p className="max-w-[200px] truncate font-medium text-gray-900 lg:max-w-xs">
                  {selectedActivity.name}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="text-sm text-teal-900">Activa</span>
              </div>
            </div>
          ) : null
        }
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          {/* Left Column - Activity Selection */}
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
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-800">{success}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!selectedActivity && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <AttendanceEmptyState
                  className="border-0 shadow-none sm:p-6"
                  icon={<FaUserFriends className="h-7 w-7" />}
                  title="Selecciona una actividad"
                  description="Para registrar invitados, elige una actividad en el panel izquierdo."
                />
              </div>
            )}

            {/* Guest Registration Form */}
            {selectedActivity && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Registro de Personas</h2>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    {showForm ? 'Cancelar' : 'Nuevo Registro'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nombre Completo *
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        placeholder="Ej: Juan Pérez"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="cedula"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Cédula (Opcional)
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                          placeholder="Ej: 12345678"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Teléfono (Opcional)
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                          placeholder="Ej: 555-1234"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Registrando...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="w-4 h-4" />
                            Registrar Persona 
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {selectedActivity && !loading && attendanceRecords.length === 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <AttendanceEmptyState
                  className="border-0 shadow-none sm:p-6"
                  icon={<FaUsers className="h-7 w-7" />}
                  title="Aún no hay registros"
                  description="Registra invitados con el formulario para verlos en esta lista."
                />
              </div>
            )}

            {/* Attendance Records */}
            {selectedActivity && attendanceRecords.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Registros de asistencia</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUsers className="h-4 w-4 text-teal-600" />
                      <span className="text-gray-600">{getBeneficiariosCount()} beneficiarios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUserFriends className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">{getGuestsCount()} invitados</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceRecords.map((record) => {
                    const isBeneficiario = record.attendance_type === 'beneficiario';
                    
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isBeneficiario ? 'bg-teal-100' : 'bg-gray-100'
                          }`}>
                            {isBeneficiario ? (
                              <FaUsers className="h-4 w-4 text-teal-600" />
                            ) : (
                              <FaUserFriends className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{record.full_name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {record.cedula && <span>Cédula: {record.cedula}</span>}
                              {record.phone && <span>Tel: {record.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {record.created_at &&
                              new Date(record.created_at).toLocaleString('es-ES')}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isBeneficiario 
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isBeneficiario ? 'Beneficiario' : 'Invitado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                  <span className="ml-3 text-gray-600">Procesando...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
