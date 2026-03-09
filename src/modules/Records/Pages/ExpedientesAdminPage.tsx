import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import {FileText, Search, CheckCircle, XCircle, Clock, AlertCircle, User, BarChart3, ChevronUp, ChevronDown, Trash2, Edit3, Plus, Users, IdCard, Filter } from 'lucide-react';
import {getRecords, getRecordStats, approvePhase1, rejectPhase1, requestPhase1Modification, requestPhase3Modification, approveRecord, rejectRecord, getRecordById, deleteRecord, addNote, handoverRecordToUser } from '../Services/recordsApi';
import type { Record, RecordStats, RecordWithDetails } from '../Types/records';
import RecordDetailsModal from '../Components/RecordDetailsModal';
import Phase3ModificationModal from '../Components/Phase3ModificationModal';
import AdminActionModal from '../Components/AdminActionModal';
import HandoverModal from '../Components/HandoverModal';
import AnalyticsCharts from '../../Dashboards/Components/AnalyticsCharts';
import IDCardModal from '../Components/IDCardModal';

const ExpedientesAdminPage: React.FC = () => {
  // State Management
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState<RecordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [creatorFilter, setCreatorFilter] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<RecordWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [pendingAction, setPendingAction] = useState<string>('');
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [showPhase3ModModal, setShowPhase3ModModal] = useState(false);
  const [phase3ModLoading, setPhase3ModLoading] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverRecordId, setHandoverRecordId] = useState<number | null>(null);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const [showIDCardModal, setShowIDCardModal] = useState(false);
  const [idCardRecordId, setIdCardRecordId] = useState<number | null>(null);
  const [pendingExpandRecordId, setPendingExpandRecordId] = useState<number | null>(null);
  const [mobileLoadingRecordId, setMobileLoadingRecordId] = useState<number | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showRecordDetailsModal, setShowRecordDetailsModal] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState('overview');
  const [recordIdToDelete, setRecordIdToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ===== DATA LOADING =====
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsResponse, statsResponse] = await Promise.all([
        getRecords(currentPage, 10, statusFilter, '', searchTerm, creatorFilter),
        getRecordStats()
      ]);

      setRecords(recordsResponse.records);
      setTotalPages(recordsResponse.totalPages);
      setStats(statsResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, creatorFilter]);

  // ===== EFFECTS =====
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== RECORD DETAILS MODAL (view in modal instead of expanded row) =====
  const openRecordDetails = useCallback(async (recordId: number) => {
    if (showRecordDetailsModal && selectedRecord?.id === recordId) {
      setShowRecordDetailsModal(false);
      setSelectedRecord(null);
      setExpandedRows(new Set());
      return;
    }
    setMobileLoadingRecordId(recordId);
    try {
      const recordDetails = await getRecordById(recordId);
      setSelectedRecord(recordDetails);
      setExpandedRows(new Set([recordId]));
      setShowRecordDetailsModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando detalles del expediente');
    } finally {
      setMobileLoadingRecordId(null);
    }
  }, [showRecordDetailsModal, selectedRecord?.id]);

  const closeRecordDetailsModal = useCallback(() => {
    setShowRecordDetailsModal(false);
    setSelectedRecord(null);
    setExpandedRows(new Set());
    setMobileLoadingRecordId(null);
  }, []);

  // After switching from enhanced view to table view, open modal for the queued record
  useEffect(() => {
    if (!showEnhancedView && pendingExpandRecordId) {
      openRecordDetails(pendingExpandRecordId);
      setPendingExpandRecordId(null);
    }
  }, [showEnhancedView, pendingExpandRecordId, openRecordDetails]);

  // ===== ACTION HANDLERS =====
  const handleAction = async (recordId: number, action: string) => {
    try {
      setActionLoading(action);

      switch (action) {
        case 'approve-phase1':
          await approvePhase1(recordId, comment);
          break;
        case 'reject-phase1':
          await rejectPhase1(recordId, comment);
          break;
        case 'request-modification':
          await requestPhase1Modification(recordId, comment);
          break;
        case 'approve-record':
          await approveRecord(recordId, comment);
          break;
        case 'reject-record':
          await rejectRecord(recordId, comment);
          break;
        case 'add-note':
          // Agregar nota sin cambiar el estado del expediente
          if (selectedRecord && comment.trim()) {
            await addNote(selectedRecord.id, comment.trim(), 'activity');
          }
          break;
        case 'request-phase3-modification':
          // This will be handled by the modal
          break;
      }

      // Reload data and reset UI
      if (action !== 'add-note') {
        await loadData();
        setSelectedRecord(null);
        setExpandedRows(new Set());
      } else {
        // Para add-note, solo recargar los detalles del expediente actual
        if (selectedRecord) {
          const updatedRecord = await getRecordById(selectedRecord.id);
          setSelectedRecord(updatedRecord);
        }
      }
      
      setShowModal(false);
      setComment('');
      setPendingAction('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ejecutando acción');
    } finally {
      setActionLoading(null);
    }
  };

  const initiateAction = useCallback((action: string, _recordId?: number) => {
    void _recordId; // kept for call-site API; selectedRecord is used by modal
    setPendingAction(action);
    setShowModal(true);
  }, []);

  const handlePhase3Modification = useCallback(async (data: {
    comment: string;
    sectionsToModify: string[];
    documentsToReplace: number[];
  }) => {
    if (!selectedRecord) return;

    try {
      setPhase3ModLoading(true);
      await requestPhase3Modification(
        selectedRecord.id,
        data.comment,
        data.sectionsToModify,
        data.documentsToReplace
      );
      await loadData();
      setShowPhase3ModModal(false);
    } catch (err) {
      console.error('Error requesting Phase 3 modification:', err);
      setError(err instanceof Error ? err.message : 'Error solicitando modificación de Fase 3');
    } finally {
      setPhase3ModLoading(false);
    }
  }, [selectedRecord, loadData]);

  // ===== RECORD DELETION =====
  const handleDeleteRecord = useCallback(async (recordId: number) => {
    try {
      setDeletingRecordId(recordId);
      setDeleteLoading(true);
      await deleteRecord(recordId);
      await loadData();
      if (expandedRows.has(recordId)) {
        const newExpandedRows = new Set(expandedRows);
        newExpandedRows.delete(recordId);
        setExpandedRows(newExpandedRows);
        setSelectedRecord(null);
      }
      setRecordIdToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando expediente');
    } finally {
      setDeletingRecordId(null);
      setDeleteLoading(false);
    }
  }, [expandedRows, loadData]);

  const openDeleteConfirm = useCallback((recordId: number) => {
    setRecordIdToDelete(recordId);
  }, []);

  const confirmDeleteRecord = useCallback(() => {
    if (recordIdToDelete == null) return;
    handleDeleteRecord(recordIdToDelete);
  }, [recordIdToDelete, handleDeleteRecord]);

  const handleHandoverRecord = useCallback(async (userId: number) => {
    if (!handoverRecordId) return;
    
    try {
      setHandoverLoading(true);
      await handoverRecordToUser(handoverRecordId, userId);
      await loadData(); // Refresh the records list
      setShowHandoverModal(false);
      setHandoverRecordId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error entregando expediente');
    } finally {
      setHandoverLoading(false);
    }
  }, [handoverRecordId, loadData]);

  const initiateHandover = useCallback((recordId: number) => {
    setHandoverRecordId(recordId);
    setShowHandoverModal(true);
  }, []);

  // ===== UTILITY FUNCTIONS =====
  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'gray', icon: Clock, text: 'Borrador' };
      case 'pending':
        return { color: 'yellow', icon: Clock, text: 'Pendiente' };
      case 'needs_modification':
        return { color: 'orange', icon: Edit3, text: 'Necesita Modificación' };
      case 'approved':
        return { color: 'green', icon: CheckCircle, text: 'Aprobado' };
      case 'rejected':
        return { color: 'red', icon: XCircle, text: 'Rechazado' };
      case 'active':
        return { color: 'green', icon: CheckCircle, text: 'Activo' };
      case 'inactive':
        return { color: 'gray', icon: AlertCircle, text: 'Inactivo' };
      default:
        return { color: 'gray', icon: Clock, text: 'Desconocido' };
    }
  }, []);

  // ===== RENDER HELPERS =====
  const getStatusBadgeClass = (status: string): string => {
    const base = 'inline-flex w-fit items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium';
    switch (status) {
      case 'draft': return `${base} bg-gray-100 text-gray-800`;
      case 'pending': return `${base} bg-yellow-100 text-yellow-800`;
      case 'needs_modification': return `${base} bg-orange-100 text-orange-800`;
      case 'approved': return `${base} bg-green-100 text-green-800`;
      case 'rejected': return `${base} bg-red-100 text-red-800`;
      case 'active': return `${base} bg-green-100 text-green-800`;
      case 'inactive': return `${base} bg-gray-100 text-gray-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getPhaseBadgeClass = (phase: string): string => {
    const base = 'inline-flex w-fit items-center px-1.5 py-0.5 rounded text-xs font-medium';
    switch (phase) {
      case 'phase1': return `${base} bg-blue-100 text-blue-800`;
      case 'phase2': return `${base} bg-yellow-100 text-yellow-800`;
      case 'phase3': return `${base} bg-purple-100 text-purple-800`;
      case 'phase4': return `${base} bg-green-100 text-green-800`;
      case 'completed': return `${base} bg-green-100 text-green-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getPhaseShortText = (phase: string): string => {
    switch (phase) {
      case 'phase1': return 'Fase 1';
      case 'phase2': return 'Fase 2';
      case 'phase3': return 'Fase 3';
      case 'phase4': return 'Fase 4';
      case 'completed': return 'Completado';
      default: return '—';
    }
  };

  const renderStatusBadge = useCallback((status: string) => {
    const statusInfo = getStatusInfo(status);
    const StatusIcon = statusInfo.icon;
    return (
      <span className={getStatusBadgeClass(status)}>
        <StatusIcon className="w-3 h-3 shrink-0" />
        {statusInfo.text}
      </span>
    );
  }, [getStatusInfo]);

  const renderPhaseBadge = useCallback((phase: string) => {
    return (
      <span className={getPhaseBadgeClass(phase)}>
        {getPhaseShortText(phase)}
      </span>
    );
  }, []);

  // Handle Phase 3 modification click - moved outside to avoid hooks rule violation
  const renderActionButtons = useCallback((record: Record) => {
    return (
      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => (showRecordDetailsModal && selectedRecord?.id === record.id) ? closeRecordDetailsModal() : openRecordDetails(record.id)}
          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
          title={showRecordDetailsModal && selectedRecord?.id === record.id ? "Cerrar detalles" : "Ver detalles"}
        >
          {showRecordDetailsModal && selectedRecord?.id === record.id ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => { window.location.href = `/admin/expedientes/editar/${record.id}`; }}
          className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded hover:bg-orange-50"
          title="Editar expediente (Admin)"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => { setIdCardRecordId(record.id); setShowIDCardModal(true); }}
          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
          title="Ver carnet"
        >
          <IdCard className="w-4 h-4" />
        </button>

        {record.admin_created && !record.handed_over_to_user ? (
          <button
            type="button"
            onClick={() => initiateHandover(record.id)}
            className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
            title="Entregar expediente a usuario"
          >
            <Users className="w-4 h-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openDeleteConfirm(record.id);
          }}
          disabled={deletingRecordId === record.id}
          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
          title="Eliminar expediente"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }, [showRecordDetailsModal, selectedRecord?.id, deletingRecordId, closeRecordDetailsModal, openRecordDetails, openDeleteConfirm, initiateHandover]);

  // ===== LOADING & ERROR STATES =====
  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando expedientes...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 max-w-8xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Header - stacks on mobile */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Gestión de Expedientes</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 hidden sm:block">Administra y revisa los expedientes de beneficiarios</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowEnhancedView(!showEnhancedView)}
              className={`inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-2 border text-sm font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation ${
                showEnhancedView
                  ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showEnhancedView ? 'Vista Tabla' : 'Graficos'}
            </button>
            <Link
              to="/admin/expedientes/crear-directo"
              className="inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors min-h-[44px] touch-manipulation"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Expediente
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics View */}
      {showEnhancedView ? (
        <div className="space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
          {/* Advanced Filters */}

          {/* Analytics Charts */}
          <AnalyticsCharts
            records={records}
            stats={stats}
            onTabChange={setAnalyticsTab}
          />

          {/* Recent Records Summary - only on Resumen tab */}
          {analyticsTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Expedientes Recientes</h3>
              <button 
                onClick={() => setShowEnhancedView(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver vista detallada
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {records
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 6)
                .map((record) => (
                <div key={record.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {record.record_number}
                    </span>
                    {renderStatusBadge(record.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {record.complete_personal_data?.full_name || record.personal_data?.full_name || 'Sin nombre'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => { setPendingExpandRecordId(record.id); setShowEnhancedView(false); }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => window.location.href = `/admin/expedientes/editar/${record.id}`}
                        className="text-orange-600 hover:text-orange-900"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      ) : (
        <>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Expedientes</h2>
          {/* Mobile: toggle to show/hide filters */}
          <button
            type="button"
            onClick={() => setShowFiltersMobile((v) => !v)}
            className="lg:hidden flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium touch-manipulation"
          >
            <Filter className="w-4 h-4" />
            {showFiltersMobile ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>

        <div className={`rounded-lg bg-gray-50 border border-gray-200 p-3 sm:p-4 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="w-full sm:w-48 sm:max-w-[12rem]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Número, nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:flex lg:gap-3">
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                </select>
              </div>
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Creador</label>
                <select
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="user">Usuarios</option>
                  <option value="admin">Administradores</option>
                </select>
              </div>
            </div>
            {(searchTerm || statusFilter || creatorFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCreatorFilter('');
                }}
                className="shrink-0 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Mobile: card list (tap to open record details modal) */}
        <div className="lg:hidden space-y-2">
          {records.map((record) => {
            const name = record.complete_personal_data?.full_name ||
              record.personal_data?.full_name ||
              'Sin nombre';
            const displayName = name.length > 14 ? `${name.slice(0, 14)}...` : name;
            const isLoading = mobileLoadingRecordId === record.id;
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => openRecordDetails(record.id)}
                disabled={isLoading}
                className="w-full text-left block bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md active:bg-gray-50 transition-all touch-manipulation disabled:opacity-70"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{displayName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{record.record_number}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {renderStatusBadge(record.status)}
                      {renderPhaseBadge(record.phase)}
                    </div>
                  </div>
                  <span className="shrink-0 text-blue-600 text-sm font-medium">
                    {isLoading ? 'Cargando…' : 'Ver expediente'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="w-full table-auto divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20%]">
                      Número
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[30%]">
                      Nombre
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[15%] whitespace-nowrap">
                      Estado / Fase
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[15%]">
                      Fecha
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20%]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <React.Fragment key={record.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {record.record_number}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900">
                                {(() => {
                                  const name = record.complete_personal_data?.full_name ||
                                    record.personal_data?.full_name ||
                                    'Sin nombre';
                                  return name.length > 7 ? `${name.slice(0, 20)}...` : name;
                                })()}
                              </div>
                              <div className="text-gray-500 text-xs truncate">
                                {record.complete_personal_data?.cedula ||
                                  record.personal_data?.cedula ||
                                  'Sin cédula'}
                              </div>
                              <div className="mt-0.5">
                                {record.admin_created ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                    <User className="w-3 h-3 mr-1" />
                                    Admin
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    <User className="w-3 h-3 mr-1" />
                                    Usuario
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 w-[1%] align-top">
                          <div className="flex flex-col gap-0.5 items-start">
                            {renderStatusBadge(record.status)}
                            {renderPhaseBadge(record.phase)}
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm font-medium">
                          {renderActionButtons(record)}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination - touch-friendly on mobile */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="min-h-[44px] px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {records.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter || creatorFilter
              ? 'No se encontraron expedientes que coincidan con los filtros'
              : 'No hay expedientes disponibles'
            }
          </div>
        )}
      </div>

      {/* Record details modal (desktop + mobile): view in modal instead of expanded row */}
      <RecordDetailsModal
        isOpen={showRecordDetailsModal && !!selectedRecord}
        record={selectedRecord}
        onClose={closeRecordDetailsModal}
        editHref={selectedRecord ? `/admin/expedientes/editar/${selectedRecord.id}` : undefined}
      >
        {selectedRecord && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(selectedRecord.phase === 'phase3' || selectedRecord.phase === 'phase4' || selectedRecord.phase === 'completed') && (
              <button
                type="button"
                onClick={() => initiateAction('add-note', selectedRecord.id)}
                className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Agregar Comentario
              </button>
            )}
            {selectedRecord.phase === 'phase1' && selectedRecord.status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => initiateAction('approve-phase1', selectedRecord.id)}
                  className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar Fase 1
                </button>
                <button
                  type="button"
                  onClick={() => initiateAction('request-modification', selectedRecord.id)}
                  className="inline-flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Solicitar Modificación
                </button>
                <button
                  type="button"
                  onClick={() => initiateAction('reject-phase1', selectedRecord.id)}
                  className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar Fase 1
                </button>
              </>
            )}
            {(selectedRecord.phase === 'phase3' || selectedRecord.phase === 'phase4') && selectedRecord.status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => initiateAction('approve-record', selectedRecord.id)}
                  className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprobar Expediente Completo
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const recordDetails = await getRecordById(selectedRecord.id);
                      setSelectedRecord(recordDetails);
                      setShowPhase3ModModal(true);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Error cargando detalles del expediente');
                    }
                  }}
                  disabled={phase3ModLoading}
                  className="inline-flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm disabled:opacity-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Solicitar Modificación Fase 3
                </button>
                <button
                  type="button"
                  onClick={() => initiateAction('reject-record', selectedRecord.id)}
                  className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar Expediente Completo
                </button>
              </>
            )}
          </div>
        )}
      </RecordDetailsModal>

      {/* Modal unificado para acciones de Fase 1 y expediente */}
      {showModal && selectedRecord && (
        <AdminActionModal
          isOpen={showModal}
          title={
            pendingAction === 'add-note' ? 'Agregar Comentario' :
            pendingAction === 'approve-phase1' ? 'Aprobar Fase 1' :
            pendingAction === 'reject-phase1' ? 'Rechazar Fase 1' :
            pendingAction === 'request-modification' ? 'Solicitar Modificación' :
            pendingAction === 'approve-record' ? 'Aprobar Expediente Completo' :
            'Rechazar Expediente Completo'
          }
          message={
            pendingAction === 'add-note' ? 'Escriba el comentario para el expediente.' :
            pendingAction.includes('approve') ?
              '¿Está seguro de que desea aprobar este expediente?' :
              pendingAction === 'request-modification' ?
              '¿Está seguro de que desea solicitar modificación de este expediente?' :
              '¿Está seguro de que desea rechazar este expediente?'
          }
          comment={comment}
          setComment={setComment}
          requireComment={pendingAction === 'add-note' || pendingAction === 'request-modification' || pendingAction === 'reject-phase1' || pendingAction === 'reject-record'}
          confirmLabel={
            pendingAction === 'add-note' ? 'Agregar' :
            pendingAction.includes('approve') ? 'Aprobar' :
            pendingAction === 'request-modification' ? 'Solicitar Modificación' :
            'Rechazar'
          }
          loading={actionLoading === pendingAction}
          onConfirm={() => handleAction(selectedRecord.id, pendingAction)}
          onCancel={() => {
            setShowModal(false);
            setComment('');
            setPendingAction('');
          }}
          recordNumber={selectedRecord.record_number}
          recordName={selectedRecord.complete_personal_data?.full_name || selectedRecord.personal_data?.full_name}
        />
      )}

      {/* Delete record: simple confirmation only (no comment) */}
      {recordIdToDelete !== null && (
        <AdminActionModal
          isOpen={true}
          title="Eliminar expediente"
          message="¿Está seguro de que desea eliminar este expediente? Esta acción no se puede deshacer."
          comment=""
          setComment={() => {}}
          requireComment={false}
          hideComment={true}
          confirmLabel="Eliminar"
          loading={deleteLoading}
          onConfirm={confirmDeleteRecord}
          onCancel={() => setRecordIdToDelete(null)}
          recordNumber={records.find(r => r.id === recordIdToDelete)?.record_number}
          recordName={records.find(r => r.id === recordIdToDelete)?.complete_personal_data?.full_name || records.find(r => r.id === recordIdToDelete)?.personal_data?.full_name}
        />
      )}

      {/* Phase 3 Modification Modal */}
      {selectedRecord && (
        <Phase3ModificationModal
          isOpen={showPhase3ModModal}
          onClose={() => {
            setShowPhase3ModModal(false);
            // Don't clear selectedRecord here - keep it for the form
          }}
          onSubmit={handlePhase3Modification}
          loading={phase3ModLoading}
          record={selectedRecord}
        />
      )}

      {/* Handover Modal */}
      {handoverRecordId && (
        <HandoverModal
          isOpen={showHandoverModal}
          onClose={() => {
            setShowHandoverModal(false);
            setHandoverRecordId(null);
          }}
          onHandover={handleHandoverRecord}
          recordId={handoverRecordId}
          recordNumber={records.find(r => r.id === handoverRecordId)?.record_number || ''}
          loading={handoverLoading}
        />
      )}

      {/* ID Card Modal */}
      {showIDCardModal && idCardRecordId !== null && (
        <IDCardModal
          isOpen={showIDCardModal}
          onClose={() => { setShowIDCardModal(false); setIdCardRecordId(null); }}
          recordId={idCardRecordId}
        />
      )}
        </>
      )}
    </div>
  );
};

export default ExpedientesAdminPage;
