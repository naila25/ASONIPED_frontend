import React from 'react';
import { FileText, User, Heart, Accessibility, Home, FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { RecordWithDetails } from '../../types/records';

interface Phase3DetailsProps {
  record: RecordWithDetails;
}

const Phase3Details: React.FC<Phase3DetailsProps> = ({ record }) => {
  // Debug: Log the record data to see what's available
  console.log('=== PHASE3 DETAILS DEBUG ===');
  console.log('Record:', record);
  console.log('Disability info:', record.disability_information);
  console.log('Socioeconomic info:', record.socioeconomic_information);
  console.log('Documentation requirements:', record.documentation_requirements);
  console.log('Documents:', record.documents);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'entregado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pendiente':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'en_tramite':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregado':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'en_tramite':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Datos Personales Completos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Datos Personales Completos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Expediente</label>
            <p className="text-sm text-gray-900 font-medium">{record.record_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Inscripción</label>
            <p className="text-sm text-gray-900">
              {record.personal_data?.created_at ? new Date(record.personal_data.created_at).toLocaleDateString() : 'No disponible'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <p className="text-sm text-gray-900">{record.personal_data?.full_name || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Cédula</label>
            <p className="text-sm text-gray-900">{record.personal_data?.cedula || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sexo</label>
            <p className="text-sm text-gray-900">
              {record.personal_data?.gender === 'male' ? 'Masculino' : 
               record.personal_data?.gender === 'female' ? 'Femenino' : 'Otro'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
            <p className="text-sm text-gray-900">
              {record.personal_data?.birth_date ? new Date(record.personal_data.birth_date).toLocaleDateString() : 'No disponible'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
            <p className="text-sm text-gray-900">{record.personal_data?.birth_place || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <p className="text-sm text-gray-900">{record.personal_data?.address || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Provincia</label>
            <p className="text-sm text-gray-900">{record.personal_data?.province || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Distrito</label>
            <p className="text-sm text-gray-900">{record.personal_data?.district || 'No disponible'}</p>
          </div>
        </div>
      </div>

      {/* Información Familiar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Información Familiar</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la Madre</label>
            <p className="text-sm text-gray-900">{record.personal_data?.mother_name || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula de la Madre</label>
            <p className="text-sm text-gray-900">{record.personal_data?.mother_cedula || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Padre</label>
            <p className="text-sm text-gray-900">{record.personal_data?.father_name || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula del Padre</label>
            <p className="text-sm text-gray-900">{record.personal_data?.father_cedula || 'No disponible'}</p>
          </div>
        </div>
      </div>

      {/* Información de Discapacidad */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Accessibility className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Información de Discapacidad</h3>
        </div>
        
        {record.disability_information ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Discapacidad</label>
              <p className="text-sm text-gray-900">
                {record.disability_information.disability_type === 'fisica' ? 'Física' :
                 record.disability_information.disability_type === 'visual' ? 'Visual' :
                 record.disability_information.disability_type === 'auditiva' ? 'Auditiva' :
                 record.disability_information.disability_type === 'psicosocial' ? 'Psicosocial' :
                 record.disability_information.disability_type === 'cognitiva' ? 'Cognitiva' :
                 record.disability_information.disability_type === 'intelectual' ? 'Intelectual' :
                 record.disability_information.disability_type === 'multiple' ? 'Múltiple' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dictamen Médico</label>
              <p className="text-sm text-gray-900">{record.disability_information.medical_diagnosis || 'No disponible'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Seguro</label>
              <p className="text-sm text-gray-900">
                {record.disability_information.insurance_type === 'rnc' ? 'RnC' :
                 record.disability_information.insurance_type === 'independiente' ? 'Independiente' :
                 record.disability_information.insurance_type === 'privado' ? 'Privado' : 'Otro'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Origen de la Discapacidad</label>
              <p className="text-sm text-gray-900">
                {record.disability_information.disability_origin === 'nacimiento' ? 'Nacimiento' :
                 record.disability_information.disability_origin === 'accidente' ? 'Accidente' :
                 record.disability_information.disability_origin === 'enfermedad' ? 'Enfermedad' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certificado de Discapacidad</label>
              <p className="text-sm text-gray-900">
                {record.disability_information.disability_certificate === 'si' ? 'Sí' :
                 record.disability_information.disability_certificate === 'no' ? 'No' :
                 record.disability_information.disability_certificate === 'en_tramite' ? 'En trámite' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Inscripción en CONAPDIS</label>
              <p className="text-sm text-gray-900">
                {record.disability_information.conapdis_registration === 'si' ? 'Sí' :
                 record.disability_information.conapdis_registration === 'no' ? 'No' :
                 record.disability_information.conapdis_registration === 'en_tramite' ? 'En trámite' : 'No especificado'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay información de discapacidad disponible</p>
          </div>
        )}
      </div>

      {/* Información Socioeconómica */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Home className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Información Socioeconómica</h3>
        </div>
        
        {record.socioeconomic_information ? (
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
                 record.socioeconomic_information.family_income === '800k_1m' ? 'De 800,000 a 1,000,000 colones' :
                 record.socioeconomic_information.family_income === '1m_1.3m' ? 'De 1,000,000 a 1,300,000 colones' :
                 record.socioeconomic_information.family_income === 'mas_1.3m' ? 'Más de 1,300,000 colones' : 'No especificado'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay información socioeconómica disponible</p>
          </div>
        )}
      </div>

      {/* Documentación y Requisitos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Documentación y Requisitos</h3>
        </div>
        
        {record.documentation_requirements ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cuota de Afiliación</label>
                <p className="text-sm text-gray-900">
                  {record.documentation_requirements.affiliation_fee === 'pagada' ? 'Pagada' : 'Pendiente'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Información Bancaria</label>
                <p className="text-sm text-gray-900">{record.documentation_requirements.banking_information || 'No disponible'}</p>
              </div>
            </div>

            {/* Lista de documentos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Estado de Documentos</label>
              <div className="space-y-2">
                {[
                  { key: 'medical_diagnosis_doc', label: 'Dictamen Médico' },
                  { key: 'birth_certificate_doc', label: 'Constancia de Nacimiento' },
                  { key: 'family_cedulas_doc', label: 'Copias de Cédulas (familia)' },
                  { key: 'passport_photo_doc', label: 'Foto Tamaño Pasaporte' },
                  { key: 'pension_certificate_doc', label: 'Constancia de Pensión CCSS' },
                  { key: 'study_certificate_doc', label: 'Constancia de Estudio' }
                ].map((doc) => {
                  const status = (record.documentation_requirements as unknown as Record<string, string>)[doc.key];
                  return (
                    <div key={doc.key} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-700">{doc.label}</span>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="text-xs font-medium">
                          {status === 'entregado' ? 'Entregado' :
                           status === 'pendiente' ? 'Pendiente' :
                           status === 'en_tramite' ? 'En trámite' :
                           status === 'no_aplica' ? 'No aplica' : 'No especificado'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay información de documentación disponible</p>
          </div>
        )}
      </div>

      {/* Documentos Subidos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Documentos Subidos</h3>
        </div>
        
        {record.documents && record.documents.length > 0 ? (
          <div className="space-y-2">
            {record.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.original_name || doc.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.document_type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Tamaño no disponible'}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Sin fecha'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay documentos subidos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Phase3Details;
