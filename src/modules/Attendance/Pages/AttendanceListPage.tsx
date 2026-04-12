import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChartLine, FaDownload, FaFilter, FaUsers, FaSearch, FaExclamationTriangle, FaCalendarAlt, FaTimes, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaIdCard, FaPhone } from 'react-icons/fa';
import { activityTracksApi, attendanceRecordsApi } from '../Services/attendanceNewApi';
import AttendancePageHeader from '../Components/AttendancePageHeader';
import AttendanceEmptyState from '../Components/AttendanceEmptyState';
import type { ActivityTrack, ActivityTrackWithStats, AttendanceRecordWithDetails } from '../Types/attendanceNew';

type SortField = 'full_name' | 'attendance_type' | 'attendance_method' | 'cedula' | 'phone' | 'date';
type SortDirection = 'asc' | 'desc';

export default function AttendanceListPage() {
  const [activities, setActivities] = useState<ActivityTrackWithStats[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityTrack | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordWithDetails[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
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
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);

  const loadActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await activityTracksApi.getAll(1, 1000);
      setActivities(response.data);
    } catch {
      setError('Error al cargar actividades');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const loadAttendanceRecords = useCallback(async () => {
    if (!selectedActivity) return;
    try {
      setRecordsLoading(true);
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
    } catch {
      setError('Error al cargar registros de asistencia');
    } finally {
      setRecordsLoading(false);
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
      setExporting(true);
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
    } catch {
      setError('Error al exportar datos');
    } finally {
      setExporting(false);
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
      ? <FaSortUp className="ml-1 h-3 w-3 text-emerald-600" />
      : <FaSortDown className="ml-1 h-3 w-3 text-emerald-600" />;
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


  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="emerald"
        icon={<FaChartLine className="h-6 w-6" />}
        title="Analítica y reportes"
        description="Filtra, ordena y exporta registros de asistencia por actividad."
        actions={
          selectedActivity ? (
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Actividad</p>
                <p className="max-w-[200px] truncate font-medium text-gray-900 lg:max-w-xs">
                  {selectedActivity.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExport('csv')}
                disabled={exporting || recordsLoading || sortedAndFilteredRecords.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                title={`Exportar ${sortedAndFilteredRecords.length} registro(s)`}
              >
                <FaDownload className="h-4 w-4" />
                Exportar Excel
              </button>
            </div>
          ) : null
        }
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-100 hover:text-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              aria-label="Cerrar mensaje de error"
            >
              <FaTimes className="h-4 w-4" />
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
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Seleccionar actividad</h3>
              {activitiesLoading ? (
                <div className="space-y-2" aria-busy="true" aria-label="Cargando actividades">
                  <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                </div>
              ) : activities.length === 0 ? (
                <AttendanceEmptyState
                  className="border-0 p-4"
                  icon={<FaCalendarAlt className="h-7 w-7" />}
                  title="No hay actividades"
                  description="Crea una actividad en Gestión de actividades para ver reportes aquí."
                />
              ) : (
                <select
                  value={selectedActivity?.id || ''}
                  onChange={(e) => {
                    const activity = activities.find((a) => a.id === parseInt(e.target.value, 10));
                    setSelectedActivity(activity || null);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecciona una actividad</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} - {new Date(activity.event_date).toLocaleDateString('es-ES')}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Filters */}
            {selectedActivity && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setFiltersOpenMobile((prev) => !prev)}
                  className="inline-flex min-h-[44px] w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 lg:hidden"
                  aria-expanded={filtersOpenMobile}
                  aria-controls="attendance-report-filters"
                >
                  <span className="inline-flex items-center gap-2">
                    <FaFilter className="h-4 w-4" />
                    Filtros
                  </span>
                  {filtersOpenMobile ? (
                    <FaChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <FaChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                <h3 className="mb-4 hidden items-center gap-2 text-lg font-semibold text-gray-900 lg:flex">
                  <FaFilter className="h-4 w-4" />
                  Filtros
                </h3>
                <div
                  id="attendance-report-filters"
                  className={`${filtersOpenMobile ? 'mt-4 block' : 'hidden'} space-y-4 lg:block`}
                >
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tipo de asistencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Asistencia</label>
                    <select
                      value={filters.attendanceType}
                      onChange={(e) => setFilters({ ...filters, attendanceType: e.target.value as 'beneficiario' | 'guest' | '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Todos</option>
                      <option value="beneficiario">Beneficiarios</option>
                      <option value="guest">Invitados</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {(filters.startDate || filters.endDate || filters.attendanceType || filters.searchTerm) && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="min-h-[44px] w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — reportes y tabla */}
          <div className="space-y-6 lg:col-span-3">
            {activitiesLoading && !selectedActivity && (
              <div
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                aria-busy="true"
                aria-label="Cargando"
              >
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="h-6 w-48 animate-pulse rounded-md bg-gray-100" />
                  <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-gray-100" />
                </div>
                <div className="space-y-3 p-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              </div>
            )}

            {!selectedActivity && !activitiesLoading && activities.length > 0 && (
              <AttendanceEmptyState
                icon={<FaCalendarAlt className="h-7 w-7" />}
                title="Selecciona una actividad"
                description="Elige una actividad en el panel izquierdo para ver y exportar sus registros de asistencia."
              />
            )}

            {selectedActivity && (
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">Registros de asistencia</h2>
                    {sortedAndFilteredRecords.length > 0 && !recordsLoading && (
                      <p className="mt-1 text-sm text-gray-600">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, sortedAndFilteredRecords.length)} de{' '}
                        {sortedAndFilteredRecords.length} registro
                        {sortedAndFilteredRecords.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {sortedAndFilteredRecords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        Por página:
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="min-h-[44px] rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>

                {recordsLoading ? (
                  <div className="flex items-center justify-center gap-3 p-8" aria-busy="true">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    <span className="text-gray-600">Cargando registros...</span>
                  </div>
                ) : sortedAndFilteredRecords.length === 0 ? (
                  <div className="p-6 sm:p-8">
                    <AttendanceEmptyState
                      className="border-0 p-4"
                      icon={<FaUsers className="h-7 w-7" />}
                      title="No hay registros"
                      description={
                        filters.searchTerm || filters.attendanceType || filters.startDate || filters.endDate
                          ? 'No hay registros que coincidan con los filtros. Prueba a limpiar filtros o ajustar fechas.'
                          : 'Aún no hay registros de asistencia para esta actividad.'
                      }
                    />
                  </div>
                ) : (
                  <>
                    <ul className="divide-y divide-gray-100 md:hidden">
                      {paginatedRecords.map((record) => {
                        const dateStr =
                          record.scanned_at
                            ? new Date(record.scanned_at).toLocaleString('es-ES')
                            : record.created_at
                              ? new Date(record.created_at).toLocaleString('es-ES')
                              : '—';
                        return (
                          <li key={record.id} className="px-3 py-3">
                            <p className="text-sm font-medium text-gray-900">{record.full_name}</p>
                            {record.record_number && (
                              <p className="text-[11px] text-gray-500">Exp: {record.record_number}</p>
                            )}
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  record.attendance_type === 'beneficiario'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {record.attendance_type === 'beneficiario' ? 'Beneficiario' : 'Invitado'}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                                {record.attendance_method === 'qr_scan' ? 'QR' : 'Manual'}
                              </span>
                            </div>
                            <div className="mt-1.5 space-y-0.5 text-xs text-gray-600">
                              {record.cedula && (
                                <p className="flex items-center gap-2">
                                  <FaIdCard className="h-3 w-3 shrink-0 text-gray-400" aria-hidden />
                                  {record.cedula}
                                </p>
                              )}
                              {record.phone && (
                                <p className="flex items-center gap-2">
                                  <FaPhone className="h-3 w-3 shrink-0 text-gray-400" aria-hidden />
                                  {record.phone}
                                </p>
                              )}
                              <p className="text-[11px] text-gray-500">{dateStr}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="hidden max-h-[min(70vh,640px)] overflow-auto md:block">
                      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm">
                          <tr>
                            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleSort('full_name')}
                                className="flex w-full items-center gap-1 rounded-md px-1 py-1 text-left hover:bg-gray-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                Nombre
                                {getSortIcon('full_name')}
                              </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleSort('attendance_type')}
                                className="flex w-full items-center gap-1 rounded-md px-1 py-1 text-left hover:bg-gray-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                Tipo
                                {getSortIcon('attendance_type')}
                              </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleSort('attendance_method')}
                                className="flex w-full items-center gap-1 rounded-md px-1 py-1 text-left hover:bg-gray-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                Método
                                {getSortIcon('attendance_method')}
                              </button>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleSort('cedula')}
                                className="ml-auto flex items-center justify-end gap-1 rounded-md px-1 py-1 hover:bg-gray-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                Cédula
                                {getSortIcon('cedula')}
                              </button>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleSort('phone')}
                                className="ml-auto flex items-center justify-end gap-1 rounded-md px-1 py-1 hover:bg-gray-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                Teléfono
                                {getSortIcon('phone')}
                              </button>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                              <button
                                type="button"
                                onClick={() => handleSort('date')}
                                className="ml-auto flex items-center justify-end gap-1 rounded-md px-1 py-1 hover:bg-gray-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              >
                                Fecha
                                {getSortIcon('date')}
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {paginatedRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                {record.full_name}
                                {record.record_number && (
                                  <div className="text-xs text-gray-500">Exp: {record.record_number}</div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    record.attendance_type === 'beneficiario'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {record.attendance_type === 'beneficiario' ? 'Beneficiario' : 'Invitado'}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                {record.attendance_method === 'qr_scan' ? 'QR Scan' : 'Manual'}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-gray-900 tabular-nums">
                                {record.cedula || '—'}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-gray-900 tabular-nums">
                                {record.phone || '—'}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700 tabular-nums">
                                {record.scanned_at
                                  ? new Date(record.scanned_at).toLocaleString('es-ES')
                                  : record.created_at
                                    ? new Date(record.created_at).toLocaleString('es-ES')
                                    : '—'}
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
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
