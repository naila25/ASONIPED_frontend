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

  const handleBack = () => {
    setSuccess(false);
    setError(null);
    setCreatedRecordId(null);
    // Reset form when going back to the form
    setResetTrigger(prev => prev + 1);
    setFormKey(prev => prev + 1);
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Expediente Creado Exitosamente!
              </h1>
              
              <p className="text-gray-600 mb-6">
                El expediente ha sido creado directamente por el administrador y está activo.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>ID del Expediente:</strong> {createdRecordId}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  <strong>Estado:</strong> Activo (sin revisión requerida)
                </p>
                <p className="text-sm text-green-800 mt-1">
                  <strong>Creado por:</strong> {adminName}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  <strong>Fecha de creación:</strong> {new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleCreateAnother}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Otro Expediente
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Expediente Directo
              </h1>
              <p className="text-gray-600">
                Crear un expediente completo directamente como administrador
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Creación Directa de Expediente
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Este formulario permite crear expedientes completos directamente como administrador.
                    El expediente será creado con estado <strong>activo</strong> sin necesidad de revisión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al crear expediente
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Subiendo archivos...
                </h3>
                <div className="mt-2">
                  <div className="bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    {uploadProgress}% completado
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <Phase3Form
            key={formKey}
            onSubmit={handleSubmit}
            loading={loading}
            currentRecord={null} // No existing record for admin creation
            uploadProgress={uploadProgress}
            isAdminCreation={true} // Flag to indicate this is admin creation
            resetTrigger={resetTrigger} // Pass reset trigger to form
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDirectRecordCreation;
