import React, { useState, useEffect, useCallback } from 'react';
import {FileText, Search, CheckCircle, XCircle, Clock, AlertCircle, User, BarChart3, MapPin, Info, ChevronUp, ChevronDown, Trash2, Edit3, Trash } from 'lucide-react';
import {getRecords, getRecordStats, approvePhase1, rejectPhase1, approveRecord, rejectRecord, getRecordById, updateNote, deleteNote, deleteRecord, addNote } from '../../Utils/recordsApi';
import type { Record, RecordStats, RecordWithDetails } from '../../types/records';
import Phase3Details from './Phase3Details';

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
  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<RecordWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [pendingAction, setPendingAction] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState<number | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);

  // ===== EFFECTS =====
  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, statusFilter, phaseFilter]);

  // ===== DATA LOADING =====
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recordsResponse, statsResponse] = await Promise.all([
        getRecords(currentPage, 10, statusFilter, phaseFilter, searchTerm),
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
  }, [currentPage, statusFilter, phaseFilter, searchTerm]);

  // ===== ROW EXPANSION =====
  const toggleRowExpansion = async (recordId: number) => {
    const newExpandedRows = new Set(expandedRows);

    if (newExpandedRows.has(recordId)) {
      newExpandedRows.delete(recordId);
      setSelectedRecord(null);
    } else {
      try {
        const recordDetails = await getRecordById(recordId);
        setSelectedRecord(recordDetails);
        newExpandedRows.add(recordId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando detalles del expediente');
        return;
      }
    }

    setExpandedRows(newExpandedRows);
  };

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

  const initiateAction = (action: string, recordId?: number) => {
    setPendingAction(action);
    const targetRecordId = recordId || selectedRecord?.id;
    if (targetRecordId) {
      // Verificar que el record existe, pero mantener selectedRecord actual
      records.find(r => r.id === targetRecordId);
    }
    setShowModal(true);
  };

  // ===== NOTE MANAGEMENT =====
  const startEditNote = (noteId: number, currentText: string) => {
    setEditingNoteId(noteId);
    setEditingNoteText(currentText);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const saveEditNote = async (noteId: number) => {
    try {
      setNoteLoading(noteId);
      await updateNote(noteId, editingNoteText);

      if (selectedRecord) {
        const updatedRecord = await getRecordById(selectedRecord.id);
        setSelectedRecord(updatedRecord);
      }

      setEditingNoteId(null);
      setEditingNoteText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando comentario');
    } finally {
      setNoteLoading(null);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      setNoteLoading(noteId);
      await deleteNote(noteId);

      if (selectedRecord) {
        const updatedRecord = await getRecordById(selectedRecord.id);
        setSelectedRecord(updatedRecord);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando comentario');
    } finally {
      setNoteLoading(null);
    }
  };

  // ===== RECORD DELETION =====
  const handleDeleteRecord = async (recordId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este expediente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingRecordId(recordId);
      await deleteRecord(recordId);

      await loadData();

      if (expandedRows.has(recordId)) {
        const newExpandedRows = new Set(expandedRows);
        newExpandedRows.delete(recordId);
        setExpandedRows(newExpandedRows);
        setSelectedRecord(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando expediente');
    } finally {
      setDeletingRecordId(null);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'gray', icon: Clock, text: 'Borrador' };
      case 'pending':
        return { color: 'yellow', icon: Clock, text: 'Pendiente' };
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
  };

  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'phase1':
        return { color: 'blue', text: 'Fase 1 - Registro Inicial' };
      case 'phase2':
        return { color: 'yellow', text: 'Fase 2 - Revisión Admin' };
      case 'phase3':
        return { color: 'purple', text: 'Fase 3 - Formulario Completo' };
      case 'phase4':
        return { color: 'green', text: 'Fase 4 - Revisión Final' };
      case 'completed':
        return { color: 'green', text: 'Completado' };
      default:
        return { color: 'gray', text: 'Desconocido' };
    }
  };

  // ===== RENDER HELPERS =====
  const renderStatusBadge = (status: string) => {
    const statusInfo = getStatusInfo(status);
    const StatusIcon = statusInfo.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {statusInfo.text}
      </span>
    );
  };

  const renderPhaseBadge = (phase: string) => {
    const phaseInfo = getPhaseInfo(phase);

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${phaseInfo.color}-100 text-${phaseInfo.color}-800`}>
        {phaseInfo.text}
      </span>
    );
  };

  const renderActionButtons = (record: Record) => {
    const isPhase1Pending = record.phase === 'phase1' && record.status === 'pending';
    const isPhase3Pending = record.phase === 'phase3' && record.status === 'pending';

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => toggleRowExpansion(record.id)}
          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
          title={expandedRows.has(record.id) ? "Ocultar detalles" : "Ver detalles"}
        >
          {expandedRows.has(record.id) ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={() => handleDeleteRecord(record.id)}
          disabled={deletingRecordId === record.id}
          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
          title="Eliminar expediente"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {isPhase1Pending && (
          <>
            <button
              onClick={() => initiateAction('approve-phase1', record.id)}
              disabled={actionLoading === 'approve-phase1'}
              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50 disabled:opacity-50"
              title="Aprobar Fase 1"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => initiateAction('reject-phase1', record.id)}
              disabled={actionLoading === 'reject-phase1'}
              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
              title="Rechazar Fase 1"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}

        {isPhase3Pending && (
          <>
            <button
              onClick={() => initiateAction('approve-record', record.id)}
              disabled={actionLoading === 'approve-record'}
              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50 disabled:opacity-50"
              title="Aprobar Expediente Completo"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => initiateAction('reject-record', record.id)}
              disabled={actionLoading === 'reject-record'}
              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
              title="Rechazar Expediente Completo"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  const renderExpandedRow = (record: Record) => {
    if (!expandedRows.has(record.id) || !selectedRecord || selectedRecord.id !== record.id) {
      return null;
    }

    return (
      <tr className="bg-gray-50">
        <td colSpan={6} className="px-6 py-4">
          <div className="space-y-6">
            {/* Información del Expediente - Mostrar detalles completos para Phase 3 */}
            {selectedRecord.phase === 'phase3' ? (
              <Phase3Details record={selectedRecord} />
            ) : (
              <>
                {/* Información Personal */}
                {selectedRecord.personal_data && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Información Personal
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRecord.personal_data.full_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cédula</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRecord.personal_data.cedula}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Género</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedRecord.personal_data.gender === 'male' ? 'Masculino' : 'Femenino'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(selectedRecord.personal_data.birth_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRecord.personal_data.birth_place}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Dirección</label>
                          <p className="mt-1 text-sm text-gray-900 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {selectedRecord.personal_data.address}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Provincia</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRecord.personal_data.province}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Distrito</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedRecord.personal_data.district}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información de la PCD */}
                {selectedRecord.personal_data && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      Información de la Persona con Discapacidad
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la PCD</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRecord.personal_data.pcd_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Información de Padres</label>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Madre:</span> {selectedRecord.personal_data.mother_name} (Cédula: {selectedRecord.personal_data.mother_cedula})
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Padre:</span> {selectedRecord.personal_data.father_name} (Cédula: {selectedRecord.personal_data.father_cedula})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Comentarios y Notas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Comentarios y Notas
                </h4>
                {selectedRecord.phase === 'phase3' && (
                  <button
                    onClick={() => initiateAction('add-note', selectedRecord.id)}
                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Agregar Comentario
                  </button>
                )}
              </div>
              
              {selectedRecord.notes && selectedRecord.notes.length > 0 ? (
                <div className="space-y-4">
                  {selectedRecord.notes.map((note, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          note.type === 'milestone' ? 'bg-green-100 text-green-800' :
                          note.type === 'activity' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {note.type === 'milestone' ? 'Hito' :
                           note.type === 'activity' ? 'Actividad' : 'Nota'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Sin fecha'}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => note.id && startEditNote(note.id, note.note || '')}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Editar comentario"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => note.id && handleDeleteNote(note.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Eliminar comentario"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Editar comentario..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => note.id && saveEditNote(note.id)}
                              disabled={noteLoading === note.id}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                              {noteLoading === note.id ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={cancelEditNote}
                              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">{note.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    {selectedRecord.phase === 'phase3' 
                      ? 'No hay comentarios aún. Use el botón "Agregar Comentario" para añadir observaciones sobre este expediente.'
                      : 'No hay comentarios para este expediente.'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Acciones */}
            {(selectedRecord.phase === 'phase1' && selectedRecord.status === 'pending') && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Acciones</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={() => initiateAction('approve-phase1', selectedRecord.id)}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Fase 1
                  </button>
                  <button
                    onClick={() => initiateAction('reject-phase1', selectedRecord.id)}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Fase 1
                  </button>
                </div>
              </div>
            )}

            {(selectedRecord.phase === 'phase3' && selectedRecord.status === 'pending') && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Acciones</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={() => initiateAction('approve-record', selectedRecord.id)}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Expediente Completo
                  </button>
                  <button
                    onClick={() => initiateAction('reject-record', selectedRecord.id)}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Expediente Completo
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

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
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Gestión de Expedientes</h1>
            <p className="text-gray-600 text-sm sm:text-base">Administra y revisa todos los expedientes de beneficiarios de ASONIPED</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Expedientes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Aprobados</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Expedientes</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar expedientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las fases</option>
                <option value="phase1">Fase 1</option>
                <option value="phase2">Fase 2</option>
                <option value="phase3">Fase 3</option>
                <option value="phase4">Fase 4</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Número
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                      Nombre
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Estado
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Fase
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Fecha
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <React.Fragment key={record.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {record.record_number}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {record.personal_data?.full_name || 'Sin nombre'}
                              </div>
                              <div className="text-gray-500">
                                {record.personal_data?.cedula || 'Sin cédula'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {renderStatusBadge(record.status)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {renderPhaseBadge(record.phase)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                          {renderActionButtons(record)}
                        </td>
                      </tr>
                      {renderExpandedRow(record)}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {records.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter || phaseFilter
              ? 'No se encontraron expedientes que coincidan con los filtros'
              : 'No hay expedientes disponibles'
            }
          </div>
        )}
      </div>

      {/* Modal para comentarios */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {pendingAction === 'approve-phase1' ? 'Aprobar Fase 1' :
               pendingAction === 'reject-phase1' ? 'Rechazar Fase 1' :
               pendingAction === 'approve-record' ? 'Aprobar Expediente Completo' :
               'Rechazar Expediente Completo'}
            </h3>
            <p className="text-gray-600 mb-4">
              {pendingAction.includes('approve') ?
                '¿Está seguro de que desea aprobar este expediente?' :
                '¿Está seguro de que desea rechazar este expediente?'}
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              placeholder="Agregue un comentario sobre la decisión (opcional)..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setComment('');
                  setSelectedRecord(null);
                  setPendingAction('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction(selectedRecord.id, pendingAction)}
                disabled={actionLoading === pendingAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  pendingAction.includes('approve') ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionLoading === pendingAction ? 'Procesando...' :
                 pendingAction.includes('approve') ? 'Aprobar' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpedientesAdminPage;
