import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { getUserRecord, createInitialRecord, completeRecord } from '../../Utils/recordsApi';
import type { RecordWithDetails, Phase1Data, Phase3Data } from '../../types/records';
import {
  ProgressIndicator,
  Phase1Form,
  Phase3Form,
  RecordStatus,
  Phase3Info,
  RejectionInfo,
  IntroductionInfo
} from './Expedientes';

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
      await createInitialRecord(data);
      // Recargar el expediente completo después de crearlo
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

  const handleStartProcess = () => {
    setShowIntroduction(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadUserRecord}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Expediente</h1>
            <p className="text-gray-600">Gestiona tu expediente de beneficiario de ASONIPED</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {record && <ProgressIndicator currentPhase={record.phase} />}



      {/* Content based on record status */}
      {!record ? (
        // No hay expediente - Mostrar información introductoria o formulario de Fase 1
        showIntroduction ? (
          <IntroductionInfo onStartProcess={handleStartProcess} />
        ) : (
          <Phase1Form 
            onSubmit={handlePhase1Submit} 
            loading={submitting} 
            onBackToIntro={() => setShowIntroduction(true)}
          />
        )
      ) : record.phase === 'phase1' ? (
        // Fase 1 - Mostrar estado actual y esperar aprobación
        <RecordStatus record={record} />
      ) : record.phase === 'phase2' ? (
        // Fase 2 - Mostrar aprobación/rechazo según el status
        record.status === 'approved' ? (
          showPhase3Form ? (
            // Mostrar formulario de Fase 3
            <Phase3Form onSubmit={handlePhase3Submit} loading={submitting} currentRecord={record} />
          ) : (
            // Mostrar información de Fase 3 y botón para continuar
            <Phase3Info record={record} onContinue={handleContinueToPhase3} />
          )
        ) : record.status === 'rejected' ? (
          // Mostrar información de rechazo y opción para reiniciar
          <RejectionInfo record={record} onRestart={handleRestartProcess} />
        ) : (
          // Status pendiente - Mostrar estado actual
          <RecordStatus record={record} />
        )
      ) : record.phase === 'phase3' ? (
        // Fase 3 - Mostrar estado actual del expediente completado
        record.status === 'pending' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 text-yellow-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-medium">Expediente Completado</h3>
            </div>
            <p className="text-yellow-800 mb-4">
              Su expediente ha sido completado y está en revisión final. Debe esperar la aprobación administrativa.
            </p>
            <div className="bg-white border border-yellow-300 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Estado Actual:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>Fase:</strong> 3 (Completada)</li>
                <li>• <strong>Estado:</strong> Pendiente de revisión</li>
                <li>• <strong>Número de Expediente:</strong> {record.record_number}</li>
                <li>• <strong>Fecha de Creación:</strong> {new Date(record.created_at).toLocaleDateString()}</li>
              </ul>
            </div>
          </div>
        ) : record.status === 'approved' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 text-green-600 mb-4">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-medium">Expediente Aprobado</h3>
            </div>
            <p className="text-green-800 mb-4">
              ¡Felicitaciones! Su expediente ha sido aprobado completamente.
            </p>
            <div className="bg-white border border-green-300 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Información del Expediente:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>Número de Expediente:</strong> {record.record_number}</li>
                <li>• <strong>Estado:</strong> Aprobado</li>
                <li>• <strong>Fecha de Aprobación:</strong> {new Date(record.updated_at).toLocaleDateString()}</li>
              </ul>
            </div>
          </div>
        ) : (
          <RecordStatus record={record} />
        )
      ) : (
        // Otros estados - Mostrar estado actual
        <RecordStatus record={record} />
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Información del Proceso</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Fase 1:</strong> Registro inicial con datos personales básicos</p>
          <p>• <strong>Fase 2:</strong> Revisión administrativa de la solicitud inicial (debe ser aprobada)</p>
          <p>• <strong>Fase 3:</strong> Completar formulario completo y subir documentos (solo después de aprobación)</p>
          <p>• <strong>Fase 4:</strong> Revisión final y aprobación del expediente</p>
        </div>
        {record && record.phase === 'phase1' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Estado actual:</strong> Su expediente está en revisión. Debe esperar la aprobación de la Fase 1 antes de poder continuar con la Fase 3.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpedientesPage;

