import React from 'react';
import { FileText, User, Heart, Accessibility, Home, FileCheck, AlertCircle, CheckCircle, Clock, ExternalLink, Download, Eye } from 'lucide-react';
import type { RecordWithDetails } from '../Types/records';
import { getFileUrl, getFileName, formatFileSize, getFileIcon, previewFile, downloadFile, canPreviewInBrowser } from '../Utils/fileUtils';

interface CompleteRecordViewProps {
  record: RecordWithDetails;
  isAdmin?: boolean;
}

const CompleteRecordView: React.FC<CompleteRecordViewProps> = ({ record, isAdmin = false }) => {
  // Debug: Log record data for admin view
  React.useEffect(() => {
    if (isAdmin) {
      console.log('=== ADMIN VIEW - RECORD DATA ===');
      console.log('Record:', record);
      console.log('Disability Information:', record.disability_information);
      console.log('Disability Data (fallback):', record.disability_data);
      console.log('Complete Personal Data:', record.complete_personal_data);
      console.log('Family Information:', record.family_information);
      console.log('Socioeconomic Information:', record.socioeconomic_information);
      console.log('Socioeconomic Data (fallback):', record.socioeconomic_data);
      console.log('Documents:', record.documents);
      console.log('Registration requirements:', record.registration_requirements);
      
      // Debug medical additional data specifically
      if (record.disability_information?.medical_additional) {
        console.log('=== MEDICAL ADDITIONAL DATA ===');
        console.log('Blood Type:', record.disability_information.medical_additional.blood_type);
        console.log('Diseases:', record.disability_information.medical_additional.diseases);
        console.log('Biomechanical Benefits:', record.disability_information.medical_additional.biomechanical_benefit);
        console.log('Permanent Limitations:', record.disability_information.medical_additional.permanent_limitations);
      }
      
      // Log detallado de documentos
      if (record.documents && record.documents.length > 0) {
        console.log('=== DOCUMENTOS DETALLADOS ===');
        record.documents.forEach((doc, index) => {
          console.log(`Documento ${index + 1}:`, {
            id: doc.id,
            document_type: doc.document_type,
            file_name: doc.file_name,
            original_name: doc.original_name,
            uploaded_at: doc.uploaded_at
          });
        });
      } else {
        console.log('No hay documentos en el expediente');
      }
      
      // Log de verificación de documentos por tipo
      console.log('=== VERIFICACIÓN DE DOCUMENTOS POR TIPO ===');
      const documentTypes = ['medical_diagnosis', 'birth_certificate', 'cedula', 'photo', 'pension_certificate', 'study_certificate'];
      documentTypes.forEach(type => {
        const found = record.documents?.find(d => d.document_type === type);
        console.log(`${type}:`, found ? 'ENCONTRADO' : 'NO ENCONTRADO', found);
      });
    }
  }, [record, isAdmin]);
  const getStatusIcon = (status: string | boolean) => {
    switch (status) {
      case 'entregado':
      case true:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pendiente':
      case false:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'en_tramite':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string | boolean) => {
    switch (status) {
      case 'entregado':
      case true:
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pendiente':
      case false:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'en_tramite':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Expediente */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Expediente Completo</h3>
              <p className="text-sm text-gray-600">Número: {record.record_number}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              record.status === 'active' ? 'bg-green-100 text-green-800' :
              record.status === 'approved' ? 'bg-blue-100 text-blue-800' :
              record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              record.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {record.status === 'active' ? 'Activo' :
               record.status === 'approved' ? 'Aprobado' :
               record.status === 'pending' ? 'Pendiente' :
               record.status === 'rejected' ? 'Rechazado' :
               record.status === 'draft' ? 'Borrador' : 'Inactivo'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Fase:</span>
            <span className="ml-2 font-medium">
              {record.phase === 'phase1' ? 'Fase 1 - Registro Inicial' :
               record.phase === 'phase2' ? 'Fase 2 - Revisión' :
               record.phase === 'phase3' ? 'Fase 3 - Formulario Completo' :
               record.phase === 'phase4' ? 'Fase 4 - Revisión Final' :
               record.phase === 'completed' ? 'Completado' : 'Desconocida'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Creado:</span>
            <span className="ml-2">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Actualizado:</span>
            <span className="ml-2">{record.updated_at ? new Date(record.updated_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Datos Personales - Only show if no Phase 3 data */}
      {!record.complete_personal_data && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Datos Personales</h3>
        </div>
        
        {record.personal_data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <p className="text-sm text-gray-900">{record.personal_data.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Cédula</label>
              <p className="text-sm text-gray-900 font-mono">{record.personal_data.cedula}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <p className="text-sm text-gray-900">
                {record.personal_data.gender === 'male' ? 'Masculino' : 
                 record.personal_data.gender === 'female' ? 'Femenino' : 'Otro'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <p className="text-sm text-gray-900">
                {record.personal_data.birth_date ? new Date(record.personal_data.birth_date).toLocaleDateString() : 'No disponible'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
              <p className="text-sm text-gray-900">{record.personal_data.birth_place}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <p className="text-sm text-gray-900">{record.personal_data.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Provincia</label>
              <p className="text-sm text-gray-900">{record.personal_data.province}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantón</label>
              <p className="text-sm text-gray-900">{record.personal_data.canton || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Distrito</label>
              <p className="text-sm text-gray-900">{record.personal_data.district}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <p className="text-sm text-gray-900">{record.personal_data.email || 'No disponible'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay datos personales disponibles</p>
          </div>
        )}
        </div>
      )}

      {/* Información Personal Completa (Phase 3) */}
      {record.complete_personal_data && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Información Personal Completa</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Cédula</label>
              <p className="text-sm text-gray-900 font-mono">{record.complete_personal_data.cedula}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <p className="text-sm text-gray-900">
                {record.complete_personal_data.gender === 'male' ? 'Masculino' : 
                 record.complete_personal_data.gender === 'female' ? 'Femenino' : 'Otro'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <p className="text-sm text-gray-900">
                {record.complete_personal_data.birth_date ? new Date(record.complete_personal_data.birth_date).toLocaleDateString() : 'No disponible'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.birth_place}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección Exacta</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.exact_address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Provincia</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.province}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantón</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.canton || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Distrito</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.district}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono Principal</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.primary_phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono Secundario</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.secondary_phone || 'No disponible'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <p className="text-sm text-gray-900">{record.complete_personal_data.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
              <p className="text-sm text-gray-900">
                {record.complete_personal_data.registration_date ? new Date(record.complete_personal_data.registration_date).toLocaleDateString() : 'No disponible'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información Familiar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Información Familiar</h3>
        </div>
        
        {/* Check if we have Phase 3 family information first, then fall back to Phase 1 */}
        {(record.family_information || record.personal_data) ? (
          <>
            {/* Phase 3 Family Information - Priority */}
            {record.family_information ? (
              <>
                {/* Show mother information only if she has meaningful data */}
                {record.family_information.mother_name && record.family_information.mother_name.trim() !== '' && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Información de la Madre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Madre</label>
                        <p className="text-sm text-gray-900">{record.family_information.mother_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula de la Madre</label>
                        <p className="text-sm text-gray-900 font-mono">{record.family_information.mother_cedula || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación de la Madre</label>
                        <p className="text-sm text-gray-900">{record.family_information.mother_occupation || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono de la Madre</label>
                        <p className="text-sm text-gray-900">{record.family_information.mother_phone || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show father information only if he has meaningful data */}
                {record.family_information.father_name && record.family_information.father_name.trim() !== '' && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Información del Padre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Padre</label>
                        <p className="text-sm text-gray-900">{record.family_information.father_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula del Padre</label>
                        <p className="text-sm text-gray-900 font-mono">{record.family_information.father_cedula || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación del Padre</label>
                        <p className="text-sm text-gray-900">{record.family_information.father_occupation || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono del Padre</label>
                        <p className="text-sm text-gray-900">{record.family_information.father_phone || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show legal guardian information only if they have meaningful data */}
                {record.family_information.responsible_person && record.family_information.responsible_person.trim() !== '' && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Información del Encargado Legal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Encargado Legal</label>
                        <p className="text-sm text-gray-900">{record.family_information.responsible_person}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula del Encargado Legal</label>
                        <p className="text-sm text-gray-900 font-mono">{record.family_information.responsible_cedula || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono del Encargado Legal</label>
                        <p className="text-sm text-gray-900">{record.family_information.responsible_phone || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación del Encargado Legal</label>
                        <p className="text-sm text-gray-900">{record.family_information.responsible_occupation || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show message if no family information is available */}
                {(!record.family_information.mother_name || record.family_information.mother_name.trim() === '') && 
                 (!record.family_information.father_name || record.family_information.father_name.trim() === '') && 
                 (!record.family_information.responsible_person || record.family_information.responsible_person.trim() === '') && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No hay información familiar disponible</p>
                  </div>
                )}
              </>
            ) : (
              /* Fallback to Phase 1 data */
              <>
                {/* Show mother information only if she has meaningful data */}
                {record.personal_data?.mother_name && record.personal_data.mother_name.trim() !== '' && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Información de la Madre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Madre</label>
                        <p className="text-sm text-gray-900">{record.personal_data.mother_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula de la Madre</label>
                        <p className="text-sm text-gray-900 font-mono">{record.personal_data.mother_cedula || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación de la Madre</label>
                        <p className="text-sm text-gray-900">{record.personal_data.mother_occupation || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono de la Madre</label>
                        <p className="text-sm text-gray-900">{record.personal_data.mother_phone || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show father information only if he has meaningful data */}
                {record.personal_data?.father_name && record.personal_data.father_name.trim() !== '' && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Información del Padre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Padre</label>
                        <p className="text-sm text-gray-900">{record.personal_data.father_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula del Padre</label>
                        <p className="text-sm text-gray-900 font-mono">{record.personal_data.father_cedula || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación del Padre</label>
                        <p className="text-sm text-gray-900">{record.personal_data.father_occupation || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono del Padre</label>
                        <p className="text-sm text-gray-900">{record.personal_data.father_phone || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show legal guardian information only if they have meaningful data */}
                {record.personal_data?.legal_guardian_name && record.personal_data.legal_guardian_name.trim() !== '' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-md font-medium text-blue-900 mb-3">Información del Encargado Legal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Encargado Legal</label>
                        <p className="text-sm text-gray-900">{record.personal_data?.legal_guardian_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula del Encargado Legal</label>
                        <p className="text-sm text-gray-900 font-mono">{record.personal_data?.legal_guardian_cedula || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación del Encargado Legal</label>
                        <p className="text-sm text-gray-900">{record.personal_data?.legal_guardian_occupation || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono del Encargado Legal</label>
                        <p className="text-sm text-gray-900">{record.personal_data?.legal_guardian_phone || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show message if no family information is available */}
                {(!record.personal_data?.mother_name || record.personal_data.mother_name.trim() === '') && 
                 (!record.personal_data?.father_name || record.personal_data.father_name.trim() === '') && 
                 (!record.personal_data?.legal_guardian_name || record.personal_data.legal_guardian_name.trim() === '') && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No hay información familiar disponible</p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay información familiar disponible</p>
          </div>
        )}
      </div>

      {/* Información de Discapacidad */}
      {(record.disability_information || record.disability_data) ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Accessibility className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Información de Discapacidad</h3>
          </div>
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Discapacidad</label>
              <p className="text-sm text-gray-900">
                {(() => {
                  const disabilityType = record.disability_information?.disability_type || record.disability_data?.disability_type;
                  return disabilityType === 'fisica' ? 'Física' :
                         disabilityType === 'visual' ? 'Visual' :
                         disabilityType === 'auditiva' ? 'Auditiva' :
                         disabilityType === 'psicosocial' ? 'Psicosocial' :
                         disabilityType === 'cognitiva' ? 'Cognitiva' :
                         disabilityType === 'intelectual' ? 'Intelectual' :
                         disabilityType === 'multiple' ? 'Múltiple' : 'No especificado';
                })()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Seguro</label>
              <p className="text-sm text-gray-900">
                {(() => {
                  const insuranceType = record.disability_information?.insurance_type || record.disability_data?.insurance_type;
                  return insuranceType === 'rnc' ? 'RnC' :
                         insuranceType === 'independiente' ? 'Independiente' :
                         insuranceType === 'privado' ? 'Privado' :
                         insuranceType === 'otro' ? 'Otro' : 'No especificado';
                })()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Origen de la Discapacidad</label>
              <p className="text-sm text-gray-900">
                {(() => {
                  const disabilityOrigin = record.disability_information?.disability_origin || record.disability_data?.disability_origin;
                  return disabilityOrigin === 'nacimiento' ? 'Nacimiento' :
                         disabilityOrigin === 'accidente' ? 'Accidente' :
                         disabilityOrigin === 'enfermedad' ? 'Enfermedad' : 'No especificado';
                })()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certificado de Discapacidad</label>
              <p className="text-sm text-gray-900">
                {(() => {
                  const disabilityCertificate = record.disability_information?.disability_certificate || record.disability_data?.disability_certificate;
                  return disabilityCertificate === 'si' ? 'Sí' :
                         disabilityCertificate === 'no' ? 'No' :
                         disabilityCertificate === 'en_tramite' ? 'En trámite' : 'No especificado';
                })()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Fallback message if no disability information is available */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Accessibility className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Información de Discapacidad</h3>
          </div>
          <div className="text-center py-4 text-gray-500">
            <p>No hay información de discapacidad disponible</p>
          </div>
        </div>
      )}

      {/* Información Médica Adicional */}
      {record.disability_information?.medical_additional && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Información Médica Adicional</h3>
          </div>
          
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Información Básica</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
                  <p className="text-sm text-gray-900">
                    {record.disability_information.medical_additional.blood_type === 'A+' ? 'A+' :
                     record.disability_information.medical_additional.blood_type === 'A-' ? 'A-' :
                     record.disability_information.medical_additional.blood_type === 'B+' ? 'B+' :
                     record.disability_information.medical_additional.blood_type === 'B-' ? 'B-' :
                     record.disability_information.medical_additional.blood_type === 'AB+' ? 'AB+' :
                     record.disability_information.medical_additional.blood_type === 'AB-' ? 'AB-' :
                     record.disability_information.medical_additional.blood_type === 'O+' ? 'O+' :
                     record.disability_information.medical_additional.blood_type === 'O-' ? 'O-' :
                     'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enfermedades que Padece</label>
                  <p className="text-sm text-gray-900">
                    {record.disability_information.medical_additional.diseases || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Beneficios Biomecánicos */}
            {record.disability_information.medical_additional.biomechanical_benefit && 
             record.disability_information.medical_additional.biomechanical_benefit.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Beneficios Biomecánicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {record.disability_information.medical_additional.biomechanical_benefit.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">
                        {benefit.type === 'silla_ruedas' ? 'Silla de ruedas' :
                         benefit.type === 'baston' ? 'Bastón' :
                         benefit.type === 'andadera' ? 'Andadera' :
                         benefit.type === 'audifono' ? 'Audífono' :
                         benefit.type === 'baston_guia' ? 'Bastón guía' :
                         benefit.type === 'otro' ? 'Otro' : benefit.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limitaciones Permanentes */}
            {record.disability_information.medical_additional.permanent_limitations && 
             record.disability_information.medical_additional.permanent_limitations.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Limitaciones Permanentes</h4>
                <div className="space-y-3">
                  {record.disability_information.medical_additional.permanent_limitations.map((limitation, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {limitation.limitation === 'moverse_caminar' ? 'Moverse/caminar' :
                           limitation.limitation === 'ver_lentes' ? 'Ver con lentes' :
                           limitation.limitation === 'oir_audifono' ? 'Oír con audífono' :
                           limitation.limitation === 'comunicarse_hablar' ? 'Comunicarse/hablar' :
                           limitation.limitation === 'entender_aprender' ? 'Entender/aprender' :
                           limitation.limitation === 'relacionarse' ? 'Relacionarse' : limitation.limitation}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          limitation.degree === 'leve' ? 'bg-green-100 text-green-800' :
                          limitation.degree === 'moderada' ? 'bg-yellow-100 text-yellow-800' :
                          limitation.degree === 'severa' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {limitation.degree === 'leve' ? 'Leve' :
                           limitation.degree === 'moderada' ? 'Moderada' :
                           limitation.degree === 'severa' ? 'Severa' :
                           limitation.degree === 'no_se_sabe' ? 'No se sabe' : limitation.degree}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback for disability data without medical_additional structure */}
      {record.disability_information && !record.disability_information.medical_additional && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Información de Discapacidad (Fallback)</h3>
          </div>
          
          <div className="text-center py-4 text-gray-500">
            <p>Información médica adicional no disponible en el formato esperado</p>
            <p className="text-xs mt-2">Debug: {JSON.stringify(record.disability_information, null, 2)}</p>
          </div>
        </div>
      )}

      {/* Información Socioeconómica */}
      {record.socioeconomic_information && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Home className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Información Socioeconómica</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Vivienda</label>
              <p className="text-sm text-gray-900">
                {record.socioeconomic_information.housing_type === 'casa_propia' ? 'Casa propia' :
                 record.socioeconomic_information.housing_type === 'alquilada' ? 'Alquilada' :
                 record.socioeconomic_information.housing_type === 'prestada' ? 'Prestada' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingreso Familiar Mensual</label>
              <p className="text-sm text-gray-900">
                {record.socioeconomic_information.family_income === 'menos_200k' ? 'Menos de 200,000 colones' :
                 record.socioeconomic_information.family_income === '200k_400k' ? 'De 200,000 a 400,000 colones' :
                 record.socioeconomic_information.family_income === '400k_600k' ? 'De 400,000 a 600,000 colones' :
                 record.socioeconomic_information.family_income === '600k_800k' ? 'De 600,000 a 800,000 colones' :
                 record.socioeconomic_information.family_income === '800k_1000k' ? 'De 800,000 a 1,000,000 colones' :
                 record.socioeconomic_information.family_income === '1000k_1300k' ? 'De 1,000,000 a 1,300,000 colones' :
                 record.socioeconomic_information.family_income === 'mas_1300k' ? 'Más de 1,300,000 colones' : 'No especificado'}
              </p>
            </div>
            {record.socioeconomic_information.available_services && record.socioeconomic_information.available_services.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Servicios Disponibles</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {record.socioeconomic_information.available_services.map((service, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {service.service === 'luz' ? 'Luz' :
                       service.service === 'agua' ? 'Agua' :
                       service.service === 'telefono' ? 'Teléfono' :
                       service.service === 'alcantarillado' ? 'Alcantarillado' :
                       service.service === 'internet' ? 'Internet' : service.service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {record.socioeconomic_information.working_family_members && record.socioeconomic_information.working_family_members.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Familiares que Trabajan</label>
                <div className="space-y-2 mt-1">
                  {record.socioeconomic_information.working_family_members.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.work_type} - {member.work_place}</p>
                      {member.work_phone && <p className="text-xs text-gray-600">Tel: {member.work_phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boleta de Matrícula */}
      {record.enrollment_form && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Boleta de Matrícula</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.enrollment_form.enrollment_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Matrícula</label>
                <p className="text-sm text-gray-900">
                  {new Date(record.enrollment_form.enrollment_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {record.enrollment_form.applicant_full_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Solicitante</label>
                <p className="text-sm text-gray-900">{record.enrollment_form.applicant_full_name}</p>
              </div>
            )}
            {record.enrollment_form.applicant_cedula && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Cédula del Solicitante</label>
                <p className="text-sm text-gray-900">{record.enrollment_form.applicant_cedula}</p>
              </div>
            )}
            {record.enrollment_form.emergency_phones && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfonos de Emergencia</label>
                <p className="text-sm text-gray-900">{record.enrollment_form.emergency_phones}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documentación y Requisitos */}
      {record.registration_requirements && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Documentación y Requisitos</h3>
          </div>
          
          <div className="space-y-4">
            {/* Información de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Información de Pago</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700">Cuota de Afiliación</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(record.registration_requirements.affiliation_fee_paid ? 'entregado' : 'pendiente')}`}>
                    {getStatusIcon(record.registration_requirements.affiliation_fee_paid ? 'entregado' : 'pendiente')}
                    <span className="text-xs font-medium">
                      {record.registration_requirements.affiliation_fee_paid ? 'Pagada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-700">Información Bancaria</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(record.registration_requirements.bank_account_info ? 'entregado' : 'pendiente')}`}>
                    {getStatusIcon(record.registration_requirements.bank_account_info ? 'entregado' : 'pendiente')}
                    <span className="text-xs font-medium">
                      {record.registration_requirements.bank_account_info ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
              
              {record.registration_requirements.bank_account_info && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Cuenta:</strong> {record.registration_requirements.bank_account_info}
                  </p>
                </div>
              )}
            </div>

            {/* Lista de documentos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Estado de Documentos</label>
              <div className="space-y-2">
                {[
                  { key: 'medical_diagnosis', label: 'Dictamen Médico', backendKey: 'medical_diagnosis' },
                  { key: 'birth_certificate', label: 'Constancia de Nacimiento', backendKey: 'birth_certificate' },
                  { key: 'cedula', label: 'Copia de Cédula (solicitante)', backendKey: 'cedula' },
                  { key: 'photo', label: 'Foto Tamaño Pasaporte', backendKey: 'photo' },
                  { key: 'pension_certificate', label: 'Constancia de Pensión CCSS', backendKey: 'pension_certificate' },
                  { key: 'pension_alimentaria', label: 'Constancia de Pensión Alimentaria', backendKey: 'constancia_pension_alimentaria' },
                  { key: 'cuenta_banco_nacional', label: 'Cuenta Banco Nacional', backendKey: 'cuenta_banco_nacional' },
                  { key: 'study_certificate', label: 'Constancia de Estudio', backendKey: 'study_certificate' }
                ].map((doc) => {
                  // Verificar si existe un documento subido para este tipo
                  const uploadedDoc = record.documents?.find(d => d.document_type === doc.backendKey);
                  const status = uploadedDoc ? 'entregado' : 'pendiente';
                  
                  // Debug: Log para cada documento
                  console.log(`Documento ${doc.label}:`, {
                    backendKey: doc.backendKey,
                    uploadedDoc: uploadedDoc,
                    status: status
                  });
                  
                  return (
                    <div key={doc.key} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-700">{doc.label}</span>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="text-xs font-medium">
                          {status === 'entregado' ? 'Entregado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Observaciones generales */}
            {record.registration_requirements.general_observations && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones Generales</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">{record.registration_requirements.general_observations}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documentos Subidos */}
      {record.documents && record.documents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Documentos Subidos</h3>
          </div>
          
          <div className="space-y-2">
            {record.documents.map((doc, index) => {
              const fileUrl = getFileUrl(doc);
              const fileName = getFileName(doc);
              const fileSize = doc.file_size ? formatFileSize(doc.file_size) : 'Tamaño no disponible';
              const fileIcon = getFileIcon(fileName);
              const canPreview = canPreviewInBrowser(fileName);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{fileIcon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fileName}</p>
                      <p className="text-xs text-gray-500">
                        {doc.document_type} • {fileSize}
                        {doc.google_drive_id && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Google Drive
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileUrl && (
                      <>
                        {canPreview && (
                          <button
                            onClick={() => previewFile(fileUrl)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Vista previa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => downloadFile(fileUrl, fileName)}
                          className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Abrir en nueva pestaña"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    <span className="text-xs text-gray-500">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Sin fecha'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumen del Expediente (solo para admin) */}
      {isAdmin && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Resumen del Expediente</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {record.documents ? record.documents.length : 0}
              </div>
              <div className="text-sm text-blue-800">Documentos Subidos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {record.documents ? record.documents.filter(d => d.document_type !== 'other').length : 0}
              </div>
              <div className="text-sm text-green-800">Documentos Clasificados</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {record.registration_requirements?.affiliation_fee_paid ? 'Sí' : 'No'}
              </div>
              <div className="text-sm text-yellow-800">Cuota Pagada</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {record.phase === 'phase3' ? 'Completo' : record.phase}
              </div>
              <div className="text-sm text-purple-800">Estado Actual</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Información de Contacto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <span className="ml-2 text-gray-900">
                  {record.personal_data?.phone || 'No disponible'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">
                  {record.complete_personal_data?.email || record.personal_data?.email || 'No disponible'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Dirección:</span>
                <span className="ml-2 text-gray-900">
                  {record.personal_data?.address || 'No disponible'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Cédula:</span>
                <span className="ml-2 text-gray-900 font-mono">
                  {record.personal_data?.cedula || 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteRecordView;
