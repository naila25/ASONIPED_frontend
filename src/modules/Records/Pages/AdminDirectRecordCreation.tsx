import React, { useState } from 'react';
import { FileText, Plus, ArrowLeft, CheckCircle } from 'lucide-react';
import { createAdminDirectRecord } from '../Services/recordsApi';
import type { Phase3Data } from '../Types/records';
import Phase3Form  from '../Components/Phase3Form';

const AdminDirectRecordCreation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
      setCreatedRecordId(result.id);
      setSuccess(true);
      // Show success alert only for Admin Direct Phase 3
      window.alert('¡Expediente creado exitosamente!');
      // Force remount of the form so all inputs/files are cleared next time it's shown
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
    setError(null);
    setCreatedRecordId(null);
    // Reset form when going back to create another record
    setResetTrigger(prev => prev + 1);
    setFormKey(prev => prev + 1);
  };

  // Success state
  if (success && createdRecordId) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto min-w-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
            <div className="text-center min-w-0">
              <div className="mx-auto flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-green-100 mb-4 sm:mb-6">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                ¡Expediente Creado Exitosamente!
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                El expediente ha sido creado directamente por el administrador y está activo.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-left min-w-0">
                <p className="text-xs sm:text-sm text-green-800"><strong>ID del Expediente:</strong> {createdRecordId}</p>
                <p className="text-xs sm:text-sm text-green-800 mt-1"><strong>Estado:</strong> Activo (sin revisión requerida)</p>
                <p className="text-xs sm:text-sm text-green-800 mt-1"><strong>Creado por:</strong> {adminName}</p>
                <p className="text-xs sm:text-sm text-green-800 mt-1"><strong>Fecha de creación:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  type="button"
                  onClick={handleCreateAnother}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 min-h-[48px] border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors touch-manipulation"
                >
                  <Plus className="w-5 h-5 mr-2 flex-shrink-0" />
                  Crear Otro Expediente
                </button>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 min-h-[48px] border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors touch-manipulation"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 flex-shrink-0" />
                  Volver al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form state
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
