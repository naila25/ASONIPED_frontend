import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Plus, ArrowLeft, CheckCircle } from 'lucide-react';
import { createAdminDirectRecord } from '../Services/recordsApi';
import type { Phase3Data } from '../Types/records';
import Phase3Form from '../Components/Phase3Form';

const RecordSuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateAnother: () => void;
  recordId: number;
  adminName: string;
}> = ({ isOpen, onClose, onCreateAnother, recordId, adminName }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">¡Expediente creado!</h3>
            <p className="text-sm text-gray-500 mt-1">Registro #{recordId} creado correctamente.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          <div><span className="font-medium">ID:</span> {recordId}</div>
          <div className="mt-1"><span className="font-medium">Creado por:</span> {adminName || 'Administrador'}</div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onCreateAnother}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Crear otro
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document === 'undefined' ? null : createPortal(modal, document.body);
};

const AdminDirectRecordCreation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdRecordId, setCreatedRecordId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (data: Phase3Data) => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      // Get admin name from localStorage
      const storedUsername = localStorage.getItem('username') || 'Administrador';
      setAdminName(storedUsername);

      console.log('=== ADMIN DIRECT RECORD CREATION ===');
      console.log('Submitting data:', data);
      console.log('Admin creating record:', storedUsername);

      const result = await createAdminDirectRecord(data, (progress) => {
        setUploadProgress(progress);
      });

      console.log('Record created successfully:', result);
      const recordId = (result as any).id ?? (result as any).record_id;
      setCreatedRecordId(recordId);
      setSuccess(true);
      setShowSuccessModal(true);
      setFormKey(prev => prev + 1);
    } catch (err) {
      console.error('Error creating admin record:', err);
      setError(err instanceof Error ? err.message : 'Error creando expediente');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    setShowSuccessModal(false);
    setError(null);
    setCreatedRecordId(null);
    // Reset form when going back to create another record
    setResetTrigger(prev => prev + 1);
    setFormKey(prev => prev + 1);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // Main form state
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <RecordSuccessModal
        isOpen={showSuccessModal && success && !!createdRecordId}
        onClose={closeSuccessModal}
        onCreateAnother={handleCreateAnother}
        recordId={createdRecordId ?? 0}
        adminName={adminName}
      />
      <div className="max-w-7xl mx-auto min-w-0">
        {/* Header — más compacto en móvil */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-start sm:items-center gap-2 sm:gap-4 mb-0 min-w-0">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-shrink-0 p-1.5 sm:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              title="Volver"
              aria-label="Volver"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-md sm:rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight break-words">
                Crear Expediente Directo
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 leading-snug">
                Crear un expediente completo directamente como administrador
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-blue-800">Subiendo archivos...</h3>
                <div className="mt-2">
                  <div className="bg-blue-200 rounded-full h-2 min-w-0">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{uploadProgress}% completado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm min-w-0 overflow-x-hidden">
          <Phase3Form
            key={formKey}
            onSubmit={handleSubmit}
            loading={loading}
            currentRecord={null} // No existing record for admin creation
            uploadProgress={uploadProgress}
            isAdminCreation={true} // Flag to indicate this is admin creation
            resetTrigger={resetTrigger} // Pass reset trigger to form
            submitError={error}
            onClearSubmitError={() => setError(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDirectRecordCreation;
