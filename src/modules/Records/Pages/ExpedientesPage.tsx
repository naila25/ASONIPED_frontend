import React, { useState, useEffect } from 'react';
import IDCardModal from '../Components/IDCardModal';
import { FileText, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { getUserRecord, createInitialRecord, completeRecord, updatePhase1Data, updatePhase3Data, replaceDocument } from '../Services/recordsApi';
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showIDCardModal, setShowIDCardModal] = useState(false);
  const [idCardRecordId, setIdCardRecordId] = useState<number | null>(null);
  const [showPhase3Form, setShowPhase3Form] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [isPhase3Modification, setIsPhase3Modification] = useState(false);
  const [modificationDetails, setModificationDetails] = useState<{
    sections: string[];
    documents: number[];
    comment: string;
  } | null>(null);

  // Map backend section ids to Spanish labels for user display
  const getSectionLabel = (sectionId: string): string => {
    const labels: Record<string, string> = {
      'complete_personal_data': 'Datos Personales Completos',
      'family_information': 'Información Familiar',
      'disability_information': 'Información de Discapacidad',
      'socioeconomic_information': 'Información Socioeconómica',
      'documentation_requirements': 'Documentación Requerida'
    };
    return labels[sectionId] || sectionId;
  };

  useEffect(() => {
    loadUserRecord();
  }, []);

  // No auto-refresh - users can manually refresh if needed using the refresh button

  const loadUserRecord = async () => {
    try {
      setLoading(true);
      const userRecord = await getUserRecord();
      console.log('=== USER RECORD LOADED ===');
      console.log('User record:', userRecord);
      console.log('User record documents:', userRecord?.documents);
      console.log('Number of documents:', userRecord?.documents?.length || 0);
      console.log('User record notes:', userRecord?.notes);
      console.log('Number of notes:', userRecord?.notes?.length || 0);
      if (userRecord?.notes) {
        userRecord.notes.forEach((note, index) => {
          console.log(`Note ${index}:`, {
            id: note.id,
            note: note.note,
            type: note.type,
            created_at: note.created_at
          });
        });
      }
      setRecord(userRecord);
      
      // Check if this is a Phase 3 modification request
      if (userRecord && userRecord.phase === 'phase3' && userRecord.status === 'needs_modification') {
        console.log('This is a Phase 3 modification request');
        setIsPhase3Modification(true);
        parseModificationDetails(userRecord);
      } else {
        console.log('This is not a Phase 3 modification request');
        setIsPhase3Modification(false);
        setModificationDetails(null);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando expediente');
    } finally {
      setLoading(false);
    }
  };

  const parseModificationDetails = (record: RecordWithDetails) => {
    console.log('=== PARSING MODIFICATION DETAILS ===');
    console.log('Record:', record);
    console.log('Record notes:', record.notes);
    console.log('Record status:', record.status);
    console.log('Record phase:', record.phase);
    
    // Debug: Log each note's structure
    if (record.notes) {
      record.notes.forEach((note, index) => {
        console.log(`Note ${index}:`, {
          id: note.id,
          note: note.note,
          type: note.type,
          modification_type: (note as any).modification_type,
          admin_comment: (note as any).admin_comment,
          sections_to_modify: (note as any).sections_to_modify,
          documents_to_replace: (note as any).documents_to_replace,
          created_at: note.created_at
        });
      });
    }
    
    if (!record.notes || record.notes.length === 0) {
      console.log('No notes found in record');
      return;
    }
    
    // Find the most recent Phase 3 modification request
    const modificationNote = record.notes
      .filter(note => {
        const noteText = note.note || '';
        const isPhase3Mod = noteText.includes('Phase 3 modification requested by admin') ||
                           noteText.includes('Modificación de Fase 3 solicitada por el administrador') ||
                           noteText.includes('phase 3 modification') ||
                           noteText.includes('fase 3 modification') ||
                           noteText.includes('Phase 3 modification') ||
                           (note as any).modification_type === 'phase3_modification';
        console.log(`Note "${noteText}" - isPhase3Mod: ${isPhase3Mod}`);
        return isPhase3Mod;
      })
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())[0];
    
    // Also try to find any note that mentions modification (but not Phase 1)
    const anyModificationNote = record.notes
      .filter(note => 
        (note.note?.toLowerCase().includes('modification') || note.note?.toLowerCase().includes('modificación')) &&
        !note.note?.toLowerCase().includes('phase 1') &&
        !note.note?.toLowerCase().includes('fase 1')
      )
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())[0];
    
    console.log('Modification note found:', modificationNote);
    console.log('Any modification note found:', anyModificationNote);
    
    // Debug: Show all notes that might be relevant
    const allRelevantNotes = record.notes.filter(note => 
      note.note?.toLowerCase().includes('modification') || 
      note.note?.toLowerCase().includes('modificación') ||
      note.note?.toLowerCase().includes('phase 3') ||
      note.note?.toLowerCase().includes('fase 3')
    );
    console.log('All potentially relevant notes:', allRelevantNotes);
    
    // Use the specific Phase 3 note if available, otherwise use any modification note
    const noteToUse = modificationNote || anyModificationNote;
    
    if (noteToUse) {
      try {
        // Check if it's the new structured format
        if ((noteToUse as any).admin_comment) {
          console.log('Using new structured format');
          
          // Parse JSON strings for sections and documents
          let sections = [];
          let documents = [];
          
          try {
            if ((noteToUse as any).sections_to_modify) {
              sections = typeof (noteToUse as any).sections_to_modify === 'string' 
                ? JSON.parse((noteToUse as any).sections_to_modify)
                : (noteToUse as any).sections_to_modify || [];
            }
          } catch (e) {
            console.error('Error parsing sections_to_modify:', e);
            sections = [];
          }
          
          try {
            if ((noteToUse as any).documents_to_replace) {
              documents = typeof (noteToUse as any).documents_to_replace === 'string'
                ? JSON.parse((noteToUse as any).documents_to_replace)
                : (noteToUse as any).documents_to_replace || [];
            }
          } catch (e) {
            console.error('Error parsing documents_to_replace:', e);
            documents = [];
          }
          
          const finalDetails = {
            sections: sections,
            documents: documents,
            comment: (noteToUse as any).admin_comment || ''
          };
          console.log('Setting modification details (new format):', finalDetails);
          setModificationDetails(finalDetails);
          return;
        }
        
        // Fallback to old format parsing
        console.log('Using old format parsing');
        const detailsMatch = noteToUse.note?.match(/Details: ({.*})/);
        console.log('Details match:', detailsMatch);
        
        if (detailsMatch) {
          const details = JSON.parse(detailsMatch[1]);
          console.log('Parsed details:', details);
          const finalDetails = {
            sections: details.sections || [],
            documents: details.documents || [],
            comment: noteToUse.note?.replace(/Phase 3 modification requested by admin: (.*?)\. Details:.*/, '$1')
                      .replace(/Modificación de Fase 3 solicitada por el administrador: (.*?)\. Details:.*/, '$1') || ''
          };
          console.log('Setting modification details (old format with details):', finalDetails);
          setModificationDetails(finalDetails);
        } else {
          // Fallback: try to extract comment without details
          const commentMatch = noteToUse.note?.match(/Phase 3 modification requested by admin: (.*?)(?:\.|$)/) ||
                              noteToUse.note?.match(/Modificación de Fase 3 solicitada por el administrador: (.*?)(?:\.|$)/);
          console.log('Comment match:', commentMatch);
          
          const comment = commentMatch ? commentMatch[1] : noteToUse.note || '';
          console.log('Final comment:', comment);
          
          const finalDetails = {
            sections: [],
            documents: [],
            comment: comment
          };
          console.log('Setting modification details (old format fallback):', finalDetails);
          setModificationDetails(finalDetails);
        }
      } catch (err) {
        console.error('Error parsing modification details:', err);
        setModificationDetails({
          sections: [],
          documents: [],
          comment: noteToUse.note || ''
        });
      }
    } else {
      console.log('No modification note found');
      // Fallback: show any admin note as a general comment (but not Phase 1)
      const adminNote = record.notes
        .filter(note => 
          note.type === 'activity' && 
          note.note?.toLowerCase().includes('admin') &&
          !note.note?.toLowerCase().includes('phase 1') &&
          !note.note?.toLowerCase().includes('fase 1') &&
          !note.note?.toLowerCase().includes('approved')
        )
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())[0];
      
      if (adminNote) {
        console.log('Using admin note as fallback:', adminNote);
        setModificationDetails({
          sections: [],
          documents: [],
          comment: adminNote.note || ''
        });
      } else {
        console.log('No suitable admin note found for fallback');
        // Set empty modification details if no suitable note is found
        setModificationDetails({
          sections: [],
          documents: [],
          comment: ''
        });
      }
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
      if (submitting) return; // Guardar contra envíos duplicados
      setSubmitting(true);
      setUploadProgress(0);
      if (!record) {
        throw new Error('No hay expediente para completar');
      }
      
      console.log('Attempting to submit Phase 3:', {
        recordId: record.id,
        phase: record.phase,
        status: record.status,
        isModification: isPhase3Modification
      });
      
      if (isPhase3Modification) {
        // This is a modification submission
        if (record.phase !== 'phase3' || record.status !== 'needs_modification') {
          throw new Error('No puede actualizar el expediente. Debe estar en Fase 3 y requerir modificación.');
        }
        
        await updatePhase3Data(record.id, data, (p) => setUploadProgress(p));
      } else {
        // This is a regular completion
      if (record.phase !== 'phase2' || record.status !== 'approved') {
        throw new Error('No puede completar el expediente. Debe estar en Fase 2 y aprobado.');
      }
      
        await completeRecord(record.id, data, (p) => setUploadProgress(p));
      }
      
      // Recargar el expediente completo después de completarlo/actualizarlo
      await loadUserRecord();
      setShowPhase3Form(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando expediente');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleContinueToPhase3 = () => {
    setShowPhase3Form(true);
  };

  const openMyIdCard = () => {
    if (record?.id) {
      setIdCardRecordId(record.id);
      setShowIDCardModal(true);
    }
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitud de Expediente</h1>
              <p className="text-gray-600">Complete el formulario inicial para comenzar su proceso de expediente</p>
            </div>
            <Phase1Form onSubmit={handlePhase1Submit} loading={submitting} />
          </div>
        </div>
      </div>
    );
  }

  // Si el expediente está completado, mostrar vista completa
  if (record.phase === 'completed' && record.status === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-8xl mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Expediente Completado</h1>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Su expediente ha sido aprobado y está activo. A continuación puede ver todos los detalles.</p>
              <button
                onClick={openMyIdCard}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Mi carnet
              </button>
            </div>
          </div>
          <CompleteRecordView record={record} isAdmin={false} />
        </div>
        {showIDCardModal && idCardRecordId !== null && (
          <IDCardModal
            isOpen={showIDCardModal}
            onClose={() => { setShowIDCardModal(false); setIdCardRecordId(null); }}
            recordId={idCardRecordId}
          />
        )}
      </div>
    );
  }

  // Mostrar progreso y estado actual
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={openMyIdCard}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Mi carnet
          </button>
        </div>
        {/* Indicador de progreso */}
        {(() => {
          // Cuando el usuario está completando el formulario de Fase 3
          // (fase2 aprobado pero con el formulario abierto), mostramos la fase3 en el indicador
          const currentPhaseForDisplay =
            record.phase === 'phase2' && record.status === 'approved' && showPhase3Form
              ? 'phase3'
              : record.phase;
          return (
            <ProgressIndicator currentPhase={currentPhaseForDisplay} />
          );
        })()}
        
        {/* Estado del expediente */}
        <div className="mt-6">
          {(() => {
            // Igualmente, sobreescribimos la fase mostrada en el componente de estado
            const phaseOverride =
              record.phase === 'phase2' && record.status === 'approved' && showPhase3Form
                ? 'phase3'
                : record.phase;
            const recordForStatus = { ...record, phase: phaseOverride } as typeof record;
            return <RecordStatus record={recordForStatus} />;
          })()}
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
              
              <div className="mt-4">
                <Phase1Form 
                  onSubmit={handlePhase1Submit} 
                  loading={submitting}
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
              loading={submitting}
              currentRecord={record}
              uploadProgress={uploadProgress}
            />
          </div>
        )}

        {record.phase === 'phase3' && record.status === 'needs_modification' && !showPhase3Form && (
          <div className="mt-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-orange-900">Modificación Requerida - Fase 3</h3>
                  <p className="text-orange-800 text-sm">El administrador ha solicitado modificaciones en su expediente completo. Por favor, revise y actualice la información según se solicite.</p>
                </div>
                <button
                  onClick={loadUserRecord}
                  className="text-orange-600 hover:text-orange-800 transition-colors p-2 rounded hover:bg-orange-100"
                  title="Verificar nuevas modificaciones"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              {/* Show admin's comment and modification details */}
              <div className="mt-4 mb-6">
                <h4 className="text-sm font-medium text-orange-900 mb-2">Comentario del Administrador:</h4>
                <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    {modificationDetails?.comment && modificationDetails.comment.trim() 
                      ? modificationDetails.comment 
                      : 'El administrador no proporcionó comentarios específicos sobre las modificaciones requeridas.'}
                  </p>
                </div>
                
                {/* Show sections that need modification */}
                {modificationDetails?.sections && modificationDetails.sections.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">Secciones a Modificar:</h4>
                    <div className="bg-white border border-orange-200 rounded-lg p-4">
                      <ul className="text-sm text-gray-700 space-y-1">
                        {modificationDetails.sections.map((section, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            {getSectionLabel(section)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Show documents that need replacement */}
                {modificationDetails?.documents && modificationDetails.documents.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">Documentos a Reemplazar:</h4>
                    <div className="bg-white border border-orange-200 rounded-lg p-4">
                      <ul className="text-sm text-gray-700 space-y-1">
                        {modificationDetails.documents.map((docId, index) => {
                          const doc = record.documents?.find(d => d.id === docId);
                          return (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              {doc ? `${doc.document_type} - ${doc.original_name}` : `Documento ID: ${docId}`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowPhase3Form(true)}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Actualizar Expediente
              </button>
            </div>
          </div>
        )}

        {record.phase === 'phase3' && record.status === 'needs_modification' && showPhase3Form && (
          <div className="mt-6">
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-900">Modificación de Expediente</h3>
              </div>
              <p className="text-sm text-orange-800">
                Está actualizando su expediente según las modificaciones solicitadas por el administrador.
              </p>
            </div>
            <Phase3Form 
              onSubmit={handlePhase3Submit} 
              loading={submitting}
              currentRecord={record}
              uploadProgress={uploadProgress}
              isModification={true}
              modificationDetails={modificationDetails}
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

