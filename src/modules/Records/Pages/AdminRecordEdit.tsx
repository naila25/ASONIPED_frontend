import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, AlertCircle, CheckCircle,  FileText } from 'lucide-react';
import { getRecordById, updateRecordAdmin } from '../Services/recordsApi';
import type { RecordWithDetails, Phase3Data } from '../Types/records';
import Phase3Form from '../Components/Phase3Form';

const AdminRecordEdit: React.FC = () => {
  const { recordId } = useParams({ strict: false });
  const navigate = useNavigate();
  const [record, setRecord] = useState<RecordWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Load record data
  useEffect(() => {
    const loadRecord = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!recordId) {
          throw new Error('ID de expediente no válido');
        }
        
        const recordData = await getRecordById(parseInt(recordId));
        if (!recordData) {
          throw new Error('Expediente no encontrado');
        }
        
        setRecord(recordData);
      } catch (err) {
        console.error('Error loading record:', err);
        setError(err instanceof Error ? err.message : 'Error cargando expediente');
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [recordId]);

  const handleSave = async (data: Phase3Data) => {
    try {
      setSaving(true);
      setError(null);
      setUploadProgress(0);

      console.log('=== ADMIN RECORD EDIT ===');
      console.log('Record ID:', recordId);
      console.log('Submitting data:', data);

      await updateRecordAdmin(parseInt(recordId!), data, (progress) => {
        setUploadProgress(progress);
      });

      console.log('Record updated successfully');
      setSuccess(true);
      
      // Redirect back to expedientes list (avoid going to /admin/expedientes/editar which 404s)
      setTimeout(() => {
        navigate({ to: '/admin/expedientes' });
      }, 2000);
    } catch (err) {
      console.error('Error updating record:', err);
      setError(err instanceof Error ? err.message : 'Error actualizando expediente');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleBack = () => {
    navigate({ to: '/admin/expedientes' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Error
              </h1>
              
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              
              <button
                onClick={handleBack}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver a Expedientes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Expediente Actualizado Exitosamente!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Los cambios han sido guardados correctamente.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>ID del Expediente:</strong> {record?.id}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  <strong>Número:</strong> {record?.record_number}
                </p>
              </div>
              
              <p className="text-sm text-gray-500">
                Redirigiendo a la lista de expedientes...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 min-w-0">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 min-w-0">
            <button
              onClick={handleBack}
              className="flex-shrink-0 p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex-shrink-0 p-2 sm:p-3 bg-orange-100 rounded-md sm:rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight break-words">
                Editar Expediente - {record.record_number}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-0 leading-snug">
                Edición administrativa con capacidad de sobreescribir
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {saving && uploadProgress > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Guardando cambios...
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
        <div className="bg-white rounded-lg shadow-sm min-w-0 overflow-x-hidden">
          <Phase3Form
            onSubmit={handleSave}
            loading={saving}
            currentRecord={record}
            uploadProgress={uploadProgress}
            isModification={true} // Flag to indicate this is editing existing record
            isAdminEdit={true} // Flag to indicate this is admin editing
            submitError={error}
            onClearSubmitError={() => setError(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminRecordEdit;


