import { useState, useEffect } from 'react';
import { FaUserFriends, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaPlus, FaUsers} from 'react-icons/fa';
import { Link, useNavigate } from '@tanstack/react-router';
import ActivitySelector from '../Components/ActivitySelector';
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

  // Load attendance records when activity is selected
  useEffect(() => {
    if (selectedActivity) {
      // Defer data loading to improve initial render
      const timer = setTimeout(() => {
        loadAttendanceRecords();
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [selectedActivity]);

  const loadAttendanceRecords = async () => {
    if (!selectedActivity) return;

    try {
      setLoading(true);
      // Load ALL attendance records (both beneficiaries and guests)
      const records = await attendanceRecordsApi.getByActivityTrack(selectedActivity.id!);
      setAttendanceRecords(records.data);
    } catch (err) {
      console.error('Error loading attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Error registering guest:', err);
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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaUserFriends className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Registro Manual 
                  </h1>
                  <p className="text-sm text-gray-600">
                    Registra asistencia con formularios
                  </p>
                </div>
              </div>
            </div>

            {selectedActivity && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Actividad actual</p>
                  <p className="font-medium text-gray-900">{selectedActivity.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Activa</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Selection */}
          <div className="lg:col-span-1">
            <ActivitySelector
              onActivitySelect={handleActivitySelect}
              selectedActivity={selectedActivity || undefined}
              showCreateButton={true}
              onCreateActivity={() => {
                navigate({ to: '../activities' as any });
              }}
            />
          </div>

          {/* Right Column - Guest Registration */}
          <div className="lg:col-span-2 space-y-6">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <FaUserFriends className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona una Actividad
                  </h3>
                  <p className="text-gray-600">
                    Para comenzar a registrar invitados, primero selecciona una actividad en el
                    panel izquierdo.
                  </p>
                </div>
              </div>
            )}

            {/* Guest Registration Form */}
            {selectedActivity && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Registro de Personas</h2>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Ej: 555-1234"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

            {/* Attendance Records */}
            {selectedActivity && attendanceRecords.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Registros de Asistencia</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUsers className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">{getBeneficiariosCount()} beneficiarios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUserFriends className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">{getGuestsCount()} invitados</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceRecords.map((record) => {
                    const isGuest = record.attendance_type === 'guest';
                    const isBeneficiario = record.attendance_type === 'beneficiario';
                    
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isBeneficiario ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {isBeneficiario ? (
                              <FaUsers className="w-4 h-4 text-blue-600" />
                            ) : (
                              <FaUserFriends className="w-4 h-4 text-purple-600" />
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
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
