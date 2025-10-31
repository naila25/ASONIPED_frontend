import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChartLine, FaArrowLeft, FaDownload, FaFilter, FaUsers, FaQrcode, FaSearch, FaExclamationTriangle, FaCalendarAlt, FaTimes, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { activityTracksApi, attendanceRecordsApi } from '../Services/attendanceNewApi';
import type { ActivityTrack, ActivityTrackWithStats, AttendanceRecordWithDetails } from '../Types/attendanceNew';

type SortField = 'full_name' | 'attendance_type' | 'attendance_method' | 'cedula' | 'phone' | 'date';
type SortDirection = 'asc' | 'desc';

export default function AttendanceListPage() {
  const [activities, setActivities] = useState<ActivityTrackWithStats[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityTrack | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    attendanceType: '' as 'beneficiario' | 'guest' | '',
    searchTerm: '', 
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

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
      setError(null);
      const response = await attendanceRecordsApi.getAll(
        1,
        1000,
        selectedActivity.id,
        filters.attendanceType || undefined,
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
  }, [selectedActivity, filters.startDate, filters.endDate, filters.attendanceType]);

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
  }, [selectedActivity, loadAttendanceRecords, filters.startDate, filters.endDate, filters.attendanceType]);

  const handleExport = async (format: 'json' | 'csv') => {
    if (!selectedActivity || sortedAndFilteredRecords.length === 0) {
      setError('No hay datos para exportar');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Export filtered and sorted records
      const dataToExport = sortedAndFilteredRecords.map(record => ({
        nombre: record.full_name,
        tipo: record.attendance_type === 'beneficiario' ? 'Beneficiario' : 'Invitado',
        metodo: record.attendance_method === 'qr_scan' ? 'QR Scan' : 'Manual',
        cedula: record.cedula || '',
        telefono: record.phone || '',
        expediente: record.record_number || '',
        fecha: record.scanned_at 
          ? new Date(record.scanned_at).toLocaleString('es-ES')
          : (record.created_at ? new Date(record.created_at).toLocaleString('es-ES') : ''),
        registrado_por: record.created_by_name || '',
      }));

      if (format === 'json') {
        const jsonBlob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(jsonBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${selectedActivity.name}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // CSV export
        const csvHeaders = ['Nombre', 'Tipo', 'Método', 'Cédula', 'Teléfono', 'Expediente', 'Fecha', 'Registrado Por'];
        const csvRows = dataToExport.map(record => [
          `"${record.nombre}"`,
          record.tipo,
          record.metodo,
          record.cedula,
          record.telefono,
          record.expediente,
          `"${record.fecha}"`,
          `"${record.registrado_por}"`
        ].join(','));
        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
        const csvBlob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(csvBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistencia_${selectedActivity.name}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      setSuccess(`${sortedAndFilteredRecords.length} registro(s) exportado(s) exitosamente`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Error al exportar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="w-3 h-3 text-gray-400 ml-1" />;
    }
    return sortDirection === 'asc' 
      ? <FaSortUp className="w-3 h-3 text-green-600 ml-1" />
      : <FaSortDown className="w-3 h-3 text-green-600 ml-1" />;
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      attendanceType: '' as 'beneficiario' | 'guest' | '',
      searchTerm: '',
    });
    setCurrentPage(1);
  };

  // Apply filters to records
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

  // Apply sorting to filtered records
  const sortedAndFilteredRecords = useMemo(() => {
    const sorted = [...filteredRecords].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'full_name':
          aValue = a.full_name?.toLowerCase() || '';
          bValue = b.full_name?.toLowerCase() || '';
          break;
        case 'attendance_type':
          aValue = a.attendance_type;
          bValue = b.attendance_type;
          break;
        case 'attendance_method':
          aValue = a.attendance_method;
          bValue = b.attendance_method;
          break;
        case 'cedula':
          aValue = a.cedula || '';
          bValue = b.cedula || '';
          break;
        case 'phone':
          aValue = a.phone || '';
          bValue = b.phone || '';
          break;
        case 'date': {
          const aDate = a.scanned_at ? new Date(a.scanned_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
          const bDate = b.scanned_at ? new Date(b.scanned_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
          aValue = aDate;
          bValue = bDate;
          break;
        }
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredRecords, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedAndFilteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = sortedAndFilteredRecords.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.attendanceType, filters.startDate, filters.endDate]);

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
                    disabled={loading || sortedAndFilteredRecords.length === 0}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={`Exportar ${sortedAndFilteredRecords.length} registro(s)`}
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
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-green-800">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}

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
                      onChange={(e) => setFilters({ ...filters, attendanceType: e.target.value as 'beneficiario' | 'guest' | '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      <option value="beneficiario">Beneficiarios</option>
                      <option value="guest">Invitados</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {(filters.startDate || filters.endDate || filters.attendanceType || filters.searchTerm) && (
                    <button
                      onClick={handleClearFilters}
                      className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Statistics & Records */}
          <div className="lg:col-span-3 space-y-6">
            {/* No Activity Selected State */}
            {!selectedActivity && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FaCalendarAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una Actividad</h3>
                <p className="text-gray-600">Elige una actividad para ver sus estadísticas y registros de asistencia</p>
              </div>
            )}

            {/* Attendance Records Table */}
            {selectedActivity && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Registros de Asistencia</h2>
                    {sortedAndFilteredRecords.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, sortedAndFilteredRecords.length)} de {sortedAndFilteredRecords.length} registro{sortedAndFilteredRecords.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {sortedAndFilteredRecords.length > 0 && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 flex items-center gap-2">
                        Por página:
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>
                
                {loading ? (
                  <div className="p-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">Cargando registros...</span>
                  </div>
                ) : sortedAndFilteredRecords.length === 0 ? (
                  <div className="p-12 text-center">
                    <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                    <p className="text-gray-600">
                      {filters.searchTerm || filters.attendanceType || filters.startDate || filters.endDate
                        ? 'No se encontraron registros que coincidan con los filtros aplicados'
                        : 'No hay registros de asistencia para esta actividad todavía'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('full_name')}
                            >
                              <div className="flex items-center">
                                Nombre
                                {getSortIcon('full_name')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('attendance_type')}
                            >
                              <div className="flex items-center">
                                Tipo
                                {getSortIcon('attendance_type')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('attendance_method')}
                            >
                              <div className="flex items-center">
                                Método
                                {getSortIcon('attendance_method')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('cedula')}
                            >
                              <div className="flex items-center">
                                Cédula
                                {getSortIcon('cedula')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('phone')}
                            >
                              <div className="flex items-center">
                                Teléfono
                                {getSortIcon('phone')}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSort('date')}
                            >
                              <div className="flex items-center">
                                Fecha
                                {getSortIcon('date')}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {record.full_name}
                                {record.record_number && (
                                  <div className="text-xs text-gray-500">Exp: {record.record_number}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    record.attendance_type === 'beneficiario'
                                      ? 'bg-blue-100 text-blue-800'
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
                                {record.scanned_at ? new Date(record.scanned_at).toLocaleString('es-ES') : (record.created_at ? new Date(record.created_at).toLocaleString('es-ES') : '-')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Página anterior"
                          >
                            <FaChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-1">
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
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    currentPage === pageNum
                                      ? 'bg-green-600 text-white'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Página siguiente"
                          >
                            <FaChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <span className="text-sm text-gray-600">
                          Página {currentPage} de {totalPages}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
