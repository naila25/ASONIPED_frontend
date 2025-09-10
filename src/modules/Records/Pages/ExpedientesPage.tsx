import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getUserRecord, createInitialRecord, completeRecord, updatePhase1Data } from '../Services/recordsApi';
import type { RecordWithDetails, Phase1Data, Phase3Data } from '../Types/records';
import {
  ProgressIndicator,
  Phase1Form,
  Phase3Form,
  RecordStatus,
  Phase3Info,
  RejectionInfo,
  IntroductionInfo,
  CompleteRecordView
} from '../Hooks/index';

// Componente principal
const ExpedientesPage: React.FC = () => {
  const [record, setRecord] = useState<RecordWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhase3Form, setShowPhase3Form] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);

  useEffect(() => {
    loadUserRecord();
  }, []);

  const loadUserRecord = async () => {
    try {
      setLoading(true);
      const userRecord = await getUserRecord();
      setRecord(userRecord);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando expediente');
    } finally {
      setLoading(false);
    }
  };

  const handlePhase1Submit = async (data: Phase1Data) => {
    try {
      setSubmitting(true);
      
      // Check if this is a modification (record exists and status is needs_modification)
      if (record && record.status === 'needs_modification') {
        await updatePhase1Data(record.id, data);
      } else {
        await createInitialRecord(data);
      }
      
      // Recargar el expediente completo después de crearlo/actualizarlo
      await loadUserRecord();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error enviando solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhase3Submit = async (data: Phase3Data) => {
    try {
      setSubmitting(true);
      if (!record) {
        throw new Error('No hay expediente para completar');
      }
      
      // Verificación adicional de seguridad
      if (record.phase !== 'phase2' || record.status !== 'approved') {
        throw new Error('No puede completar el expediente. Debe estar en Fase 2 y aprobado.');
      }
      
      console.log('Attempting to complete record:', {
        recordId: record.id,
        phase: record.phase,
        status: record.status
      });
      
      await completeRecord(record.id, data);
      // Recargar el expediente completo después de completarlo
      await loadUserRecord();
      setShowPhase3Form(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completando expediente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueToPhase3 = () => {
    setShowPhase3Form(true);
  };

  const handleRestartProcess = async () => {
    try {
      setSubmitting(true);
      // Aquí podríamos implementar la lógica para reiniciar el proceso
      // Por ahora, simplemente recargamos la página
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reiniciando proceso');
    } finally {
      setSubmitting(false);
    }
  };

  // Mostrar introducción si no hay expediente y no se está cargando
  if (showIntroduction && !record && !loading) {
    return (
      <IntroductionInfo onStartProcess={() => setShowIntroduction(false)} />
    );
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-medium text-gray-900">Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay expediente, mostrar formulario inicial
  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitud de Expediente</h1>
              <p className="text-gray-600">Complete el formulario inicial para comenzar su proceso de expediente</p>
            </div>
            <Phase1Form onSubmit={handlePhase1Submit} submitting={submitting} />
          </div>
        </div>
      </div>
    );
  }

  // Si el expediente está completado, mostrar vista completa
  if (record.phase === 'completed' && record.status === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Expediente Completado</h1>
            </div>
            <p className="text-gray-600">Su expediente ha sido aprobado y está activo. A continuación puede ver todos los detalles.</p>
          </div>
          <CompleteRecordView record={record} isAdmin={false} />
        </div>
      </div>
    );
  }

  // Mostrar progreso y estado actual
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Indicador de progreso */}
        <ProgressIndicator currentPhase={record.phase} status={record.status} />
        
        {/* Estado del expediente */}
        <div className="mt-6">
          <RecordStatus record={record} />
        </div>

        {/* Contenido específico según la fase */}
        {record.phase === 'phase1' && record.status === 'pending' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Solicitud en Revisión</h3>
                <p className="text-blue-800 text-sm">Su solicitud inicial está siendo revisada por el administrador. Recibirá una notificación cuando sea aprobada.</p>
              </div>
            </div>
          </div>
        )}

        {record.phase === 'phase1' && record.status === 'needs_modification' && (
          <div className="mt-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="text-lg font-medium text-orange-900">Modificación Requerida</h3>
                  <p className="text-orange-800 text-sm">El administrador ha solicitado modificaciones en su expediente. Por favor, revise y actualice la información según se solicite.</p>
                </div>
              </div>
              
              {/* Show admin's comment if available */}
              <div className="mt-4 mb-6">
                <h4 className="text-sm font-medium text-orange-900 mb-2">Comentario del Administrador:</h4>
                <div className="bg-white border border-orange-200 rounded-lg p-4">
                  {record.notes && record.notes.length > 0 ? (
                    record.notes
                      .filter(note => note.type === 'activity' && note.note?.includes('Modification requested'))
                      .map((note, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          <p className="font-medium text-gray-900 mb-1">
                            {note.note?.includes('Modification requested by admin: ') 
                              ? note.note.replace('Modification requested by admin: ', '')
                              : note.note?.includes('Modification requested by admin')
                              ? 'El administrador ha solicitado modificaciones en su expediente.'
                              : note.note || 'Sin comentario específico'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Sin fecha'}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay comentarios del administrador disponibles.</p>
                  )}
                  
                </div>
              </div>
              
              <div className="mt-4">
                <Phase1Form 
                  onSubmit={handlePhase1Submit} 
                  submitting={submitting}
                  currentRecord={record}
                  isModification={true}
                />
              </div>
            </div>
          </div>
        )}

        {record.phase === 'phase1' && record.status === 'rejected' && (
          <div className="mt-6">
            <RejectionInfo record={record} onRestart={handleRestartProcess} />
          </div>
        )}

        {record.phase === 'phase2' && record.status === 'approved' && !showPhase3Form && (
          <div className="mt-6">
            <Phase3Info record={record} onContinue={handleContinueToPhase3} />
          </div>
        )}

        {record.phase === 'phase2' && record.status === 'approved' && showPhase3Form && (
          <div className="mt-6">
            <Phase3Form 
              onSubmit={handlePhase3Submit} 
              submitting={submitting} 
              currentRecord={record}
            />
          </div>
        )}

        {record.phase === 'phase3' && record.status === 'pending' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-900">Expediente Completo en Revisión</h3>
                <p className="text-yellow-800 text-sm">Su expediente completo está siendo revisado para aprobación final. Este proceso puede tomar algunos días.</p>
              </div>
            </div>
          </div>
        )}

        {record.phase === 'phase3' && record.status === 'rejected' && (
          <div className="mt-6">
            <RejectionInfo record={record} onRestart={handleRestartProcess} />
          </div>
        )}

        {/* Mostrar expediente completo si está en fase 4 o completado pero no activo */}
        {(record.phase === 'phase4' || (record.phase === 'completed' && record.status !== 'active')) && (
          <div className="mt-6">
            <CompleteRecordView record={record} isAdmin={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpedientesPage;

