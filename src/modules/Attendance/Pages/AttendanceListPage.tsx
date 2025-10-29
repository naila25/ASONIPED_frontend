import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChartLine, FaArrowLeft, FaDownload, FaFilter, FaUsers, FaQrcode, FaSearch } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { analyticsApi, activityTracksApi, attendanceRecordsApi } from '../Services/attendanceNewApi';
import type { ActivityTrack, ActivityTrackWithStats, AttendanceRecord } from '../Types/attendanceNew';

export default function AttendanceListPage() {
  const [activities, setActivities] = useState<ActivityTrackWithStats[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityTrack | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    attendanceType: '' as 'beneficiario' | 'guest' | '',
    searchTerm: '', 
  });

  useEffect(() => {
    // Defer initial data loading to improve initial render
    const timer = setTimeout(() => {
      loadActivities();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedActivity) {

      // Defer data loading to improve initial render
      const timer = setTimeout(() => {
        loadAttendanceRecords();
      }, 0);
     
      return () => clearTimeout(timer);
    }
  }, [selectedActivity, filters.startDate, filters.endDate, filters.attendanceType]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await activityTracksApi.getAll(1, 1000);
      setActivities(response.data);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = useCallback(async () => {
    if (!selectedActivity) return;
    try {
      setLoading(true);
      const response = await attendanceRecordsApi.getAll(
        selectedActivity.id,
        1,
        1000,
        undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      setAttendanceRecords(response.data || []);
    } catch (err) {
      console.error('Error loading attendance records:', err);
      setError('Error al cargar registros de asistencia');
    } finally {
      setLoading(false);
    }
  }, [selectedActivity, filters.startDate, filters.endDate]);

  const handleExport = async (format: 'json' | 'csv') => {
    if (!selectedActivity) return;
    try {
      setLoading(true);
      const blob = await analyticsApi.exportData(format, filters.startDate, filters.endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asistencia_${selectedActivity.name}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Error al exportar datos');
    } finally {
      setLoading(false);
    }
  };

  //  Aplica filtros locales a los registros cargados
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesType =
        !filters.attendanceType || record.attendance_type === filters.attendanceType;
      const matchesSearch =
        !filters.searchTerm ||
        record.full_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.cedula?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [attendanceRecords, filters.attendanceType, filters.searchTerm]);

  const getBeneficiariosCount = () =>
    filteredRecords.filter(record => record.attendance_type === 'beneficiario').length;

  const getGuestsCount = () =>
    filteredRecords.filter(record => record.attendance_type === 'guest').length;

  const getQRScansCount = () =>
    filteredRecords.filter(record => record.attendance_method === 'qr_scan').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/admin/attendance" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FaArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaChartLine className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Analítica & Reportes</h1>
                  <p className="text-sm text-gray-600">Visualiza estadísticas y exporta datos de asistencia</p>
                </div>
              </div>
            </div>

            {selectedActivity && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Actividad seleccionada</p>
                  <p className="font-medium text-gray-900">{selectedActivity.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <FaDownload className="w-4 h-4" />
                    Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Activity Selection & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Activity Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Actividad</h3>
              <select
                value={selectedActivity?.id || ''}
                onChange={(e) => {
                  const activity = activities.find(a => a.id === parseInt(e.target.value));
                  setSelectedActivity(activity || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecciona una actividad</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} - {new Date(activity.event_date).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters */}
            {selectedActivity && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFilter className="w-4 h-4" />
                  Filtros
                </h3>
                <div className="space-y-4">
                  {/* Buscar por nombre o cédula */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nombre o cédula..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Fecha Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tipo de asistencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Asistencia</label>
                    <select
                      value={filters.attendanceType}
                      onChange={(e) => setFilters({ ...filters, attendanceType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      <option value="beneficiario">Beneficiarios</option>
                      <option value="guest">Invitados</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Statistics & Records */}
          <div className="lg:col-span-3 space-y-6">
            {/* Statistics Cards */}
            {selectedActivity && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Asistencia</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredRecords.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaUsers className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Beneficiarios</p>
                      <p className="text-2xl font-bold text-gray-900">{getBeneficiariosCount()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaUsers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Invitados</p>
                      <p className="text-2xl font-bold text-gray-900">{getGuestsCount()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FaQrcode className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Escaneos QR</p>
                      <p className="text-2xl font-bold text-gray-900">{getQRScansCount()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Records Table */}
            {selectedActivity && filteredRecords.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Registros de Asistencia</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.full_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.attendance_type === 'beneficiario'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {record.attendance_type === 'beneficiario' ? 'Beneficiario' : 'Invitado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.attendance_method === 'qr_scan' ? 'QR Scan' : 'Manual'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.cedula || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.phone || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.created_at && new Date(record.created_at).toLocaleString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
