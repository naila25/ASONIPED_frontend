import React from 'react';
import { FileText, User, Heart, Accessibility, Home, FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { RecordWithDetails } from '../../../types/records';

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
      console.log('Documents:', record.documents);
      console.log('Registration requirements:', record.registration_requirements);
      
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
  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

      {/* Datos Personales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Datos Personales</h3>
        </div>
        
        {record.personal_data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
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
              <label className="block text-sm font-medium text-gray-700">Distrito</label>
              <p className="text-sm text-gray-900">{record.personal_data.district}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay datos personales disponibles</p>
          </div>
        )}
      </div>

      {/* Información Familiar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Heart className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Información Familiar</h3>
        </div>
        
        {record.personal_data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Madre</label>
              <p className="text-sm text-gray-900">{record.personal_data.mother_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cédula de la Madre</label>
              <p className="text-sm text-gray-900 font-mono">{record.personal_data.mother_cedula}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Padre</label>
              <p className="text-sm text-gray-900">{record.personal_data.father_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cédula del Padre</label>
              <p className="text-sm text-gray-900 font-mono">{record.personal_data.father_cedula}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No hay información familiar disponible</p>
          </div>
        )}
      </div>

      {/* Información de Discapacidad */}
      {record.disability_information && (
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
              <label className="block text-sm font-medium text-gray-700">Origen de la Discapacidad</label>
              <p className="text-sm text-gray-900">
                {record.disability_information.disability_origin === 'nacimiento' ? 'Nacimiento' :
                 record.disability_information.disability_origin === 'accidente' ? 'Accidente' :
                 record.disability_information.disability_origin === 'enfermedad' ? 'Enfermedad' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Seguro</label>
              <p className="text-sm text-gray-900">
                {record.disability_information.insurance_type === 'rnc' ? 'RnC' :
                 record.disability_information.insurance_type === 'independiente' ? 'Independiente' :
                 record.disability_information.insurance_type === 'privado' ? 'Privado' :
                 record.disability_information.insurance_type === 'otro' ? 'Otro' : 'No especificado'}
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
            {record.disability_information.medical_diagnosis && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Dictamen Médico</label>
                <p className="text-sm text-gray-900 mt-1">{record.disability_information.medical_diagnosis}</p>
              </div>
            )}
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
                 record.socioeconomic_information.family_income === '800k_1m' ? 'De 800,000 a 1,000,000 colones' :
                 record.socioeconomic_information.family_income === '1m_1.3m' ? 'De 1,000,000 a 1,300,000 colones' :
                 record.socioeconomic_information.family_income === 'mas_1.3m' ? 'Más de 1,300,000 colones' : 'No especificado'}
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

      {/* Información de Discapacidad */}
      {record.disability_data && (
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
                {record.disability_data.disability_type === 'fisica' ? 'Física' :
                 record.disability_data.disability_type === 'visual' ? 'Visual' :
                 record.disability_data.disability_type === 'auditiva' ? 'Auditiva' :
                 record.disability_data.disability_type === 'psicosocial' ? 'Psicosocial' :
                 record.disability_data.disability_type === 'cognitiva' ? 'Cognitiva' :
                 record.disability_data.disability_type === 'intelectual' ? 'Intelectual' :
                 record.disability_data.disability_type === 'multiple' ? 'Múltiple' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dictamen Médico</label>
              <p className="text-sm text-gray-900">{record.disability_data.medical_diagnosis || 'No disponible'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Seguro</label>
              <p className="text-sm text-gray-900">
                {record.disability_data.insurance_type === 'rnc' ? 'RnC' :
                 record.disability_data.insurance_type === 'independiente' ? 'Independiente' :
                 record.disability_data.insurance_type === 'privado' ? 'Privado' : 'Otro'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Origen de la Discapacidad</label>
              <p className="text-sm text-gray-900">
                {record.disability_data.disability_origin === 'nacimiento' ? 'Nacimiento' :
                 record.disability_data.disability_origin === 'accidente' ? 'Accidente' :
                 record.disability_data.disability_origin === 'enfermedad' ? 'Enfermedad' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certificado de Discapacidad</label>
              <p className="text-sm text-gray-900">
                {record.disability_data.disability_certificate === 'si' ? 'Sí' :
                 record.disability_data.disability_certificate === 'no' ? 'No' :
                 record.disability_data.disability_certificate === 'en_tramite' ? 'En trámite' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Inscripción en CONAPDIS</label>
              <p className="text-sm text-gray-900">
                {record.disability_data.conapdis_registration === 'si' ? 'Sí' :
                 record.disability_data.conapdis_registration === 'no' ? 'No' :
                 record.disability_data.conapdis_registration === 'en_tramite' ? 'En trámite' : 'No especificado'}
              </p>
            </div>
            {record.disability_data.observations && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <p className="text-sm text-gray-900">{record.disability_data.observations}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Información Socioeconómica */}
      {record.socioeconomic_data && (
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
                {record.socioeconomic_data.housing_type === 'casa_propia' ? 'Casa propia' :
                 record.socioeconomic_data.housing_type === 'alquilada' ? 'Alquilada' :
                 record.socioeconomic_data.housing_type === 'prestada' ? 'Prestada' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingreso Familiar Mensual</label>
              <p className="text-sm text-gray-900">
                {record.socioeconomic_data.family_income === 'menos_200k' ? 'Menos de 200,000 colones' :
                 record.socioeconomic_data.family_income === '200k_400k' ? 'De 200,000 a 400,000 colones' :
                 record.socioeconomic_data.family_income === '400k_600k' ? 'De 400,000 a 600,000 colones' :
                 record.socioeconomic_data.family_income === '600k_800k' ? 'De 600,000 a 800,000 colones' :
                 record.socioeconomic_data.family_income === '800k_1000k' ? 'De 800,000 a 1,000,000 colones' :
                 record.socioeconomic_data.family_income === '1000k_1300k' ? 'De 1,000,000 a 1,300,000 colones' :
                 record.socioeconomic_data.family_income === 'mas_1300k' ? 'Más de 1,300,000 colones' : 'No especificado'}
              </p>
            </div>
            {record.socioeconomic_data.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <p className="text-sm text-gray-900">{record.socioeconomic_data.address}</p>
              </div>
            )}
            {record.socioeconomic_data.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="text-sm text-gray-900">{record.socioeconomic_data.phone}</p>
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
        </div>
      )}

      {/* Notas del Administrador (solo para admin) */}
      {isAdmin && record.notes && record.notes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Notas Administrativas</h3>
          </div>
          
          <div className="space-y-3">
            {record.notes.map((note, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{note.note}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
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
                  {record.personal_data?.primary_phone || 'No disponible'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">
                  {record.personal_data?.email || 'No disponible'}
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
