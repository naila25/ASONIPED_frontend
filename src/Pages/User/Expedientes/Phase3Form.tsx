import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, Plus, Trash2 } from 'lucide-react';
import type { Phase3Data, RecordWithDetails, RequiredDocument, AvailableService } from '../../../types/records';

interface Phase3FormProps {
  onSubmit: (data: Phase3Data) => void;
  loading: boolean;
  currentRecord: RecordWithDetails;
}

const Phase3Form: React.FC<Phase3FormProps> = ({ 
  onSubmit, 
  loading, 
  currentRecord 
}) => {
  const [form, setForm] = useState<Phase3Data>({
    complete_personal_data: {
      registration_date: new Date().toISOString().split('T')[0],
      full_name: '',
      cedula: '',
      gender: 'male',
      birth_date: '',
      birth_place: '',
      nationality: '',
      exact_address: '',
      province: '',
      district: '',
      primary_phone: '',
      secondary_phone: '',
      email: ''
    },
    family_information: {
      mother_name: '',
      mother_cedula: '',
      mother_occupation: '',
      mother_phone: '',
      father_name: '',
      father_cedula: '',
      father_occupation: '',
      father_phone: '',
      responsible_person: '',
      responsible_address: '',
      responsible_phone: '',
      family_members: []
    },
    disability_information: {
      disability_type: 'fisica',
      medical_diagnosis: '',
      insurance_type: 'rnc',
      biomechanical_benefit: [],
      disability_origin: 'nacimiento',
      disability_certificate: 'no',
      conapdis_registration: 'no',
      permanent_limitations: [],
      medical_additional: {
        diseases: '',
        blood_type: '',
        medical_observations: ''
      }
    },
    socioeconomic_information: {
      housing_type: 'casa_propia',
      available_services: [],
      family_income: 'menos_200k',
      working_family_members: []
    },
    documentation_requirements: {
      documents: [],
      affiliation_fee: 'pendiente',
      banking_information: '',
      general_observations: '',
      signatures: {
        applicant_signature: '',
        applicant_date: '',
        parent_signature: '',
        parent_date: '',
        receiver_signature: '',
        receiver_date: ''
      }
    },
    documents: []
  });

  const [documentFiles, setDocumentFiles] = useState<{ [key: string]: File | null }>({
    dictamen_medico: null,
    constancia_nacimiento: null,
    copia_cedula: null,
    copias_cedulas_familia: null,
    foto_pasaporte: null,
    constancia_pension_ccss: null,
    constancia_pension_alimentaria: null,
    constancia_estudio: null,
    cuenta_banco_nacional: null
  });

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format as yyyy-MM-dd for input[type="date"]
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Pre-fill data from Phase 1 when component mounts
  useEffect(() => {
    if (currentRecord?.personal_data) {
      const phase1Data = currentRecord.personal_data;
      
      setForm(prev => ({
        ...prev,
        complete_personal_data: {
          ...prev.complete_personal_data,
          full_name: phase1Data.full_name || '',
          cedula: phase1Data.cedula || '',
          gender: phase1Data.gender || 'male',
          birth_date: formatDateForInput(phase1Data.birth_date),
          birth_place: phase1Data.birth_place || '',
          province: phase1Data.province || '',
          district: phase1Data.district || '',
          exact_address: phase1Data.address || ''
        },
        family_information: {
          ...prev.family_information,
          mother_name: phase1Data.mother_name || '',
          mother_cedula: phase1Data.mother_cedula || '',
          father_name: phase1Data.father_name || '',
          father_cedula: phase1Data.father_cedula || ''
        }
      }));
    }
  }, [currentRecord]);

  const handleChange = (section: keyof Phase3Data, field: string, value: string | number | boolean | string[] | RequiredDocument[] | AvailableService[]) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDocumentChange = (documentType: string, file: File | null) => {
    setDocumentFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  // Handle working family members dynamically
  const addWorkingFamilyMember = () => {
    setForm(prev => ({
      ...prev,
      socioeconomic_information: {
        ...prev.socioeconomic_information,
        working_family_members: [
          ...prev.socioeconomic_information.working_family_members,
          { name: '', work_type: '', work_place: '', work_phone: '' }
        ]
      }
    }));
  };

  const removeWorkingFamilyMember = (index: number) => {
    setForm(prev => ({
      ...prev,
      socioeconomic_information: {
        ...prev.socioeconomic_information,
        working_family_members: prev.socioeconomic_information.working_family_members.filter((_, i) => i !== index)
      }
    }));
  };

  const updateWorkingFamilyMember = (index: number, field: keyof typeof form.socioeconomic_information.working_family_members[0], value: string) => {
    setForm(prev => ({
      ...prev,
      socioeconomic_information: {
        ...prev.socioeconomic_information,
        working_family_members: prev.socioeconomic_information.working_family_members.map((member, i) => 
          i === index ? { ...member, [field]: value } : member
        )
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir archivos a array
    const documents = Object.values(documentFiles).filter(file => file !== null) as File[];
    
    const formData: Phase3Data = {
      ...form,
      documents
    };
    
    onSubmit(formData);
  };

  const documentTypes = [
    { key: 'dictamen_medico', label: 'Dictamen Médico', required: true },
    { key: 'constancia_nacimiento', label: 'Constancia de Nacimiento', required: true },
    { key: 'copia_cedula', label: 'Copia de Cédula (solicitante)', required: true },
    { key: 'copias_cedulas_familia', label: 'Copias de Cédulas (familia)', required: true },
    { key: 'foto_pasaporte', label: 'Foto Tamaño Pasaporte', required: true },
    { key: 'constancia_pension_ccss', label: 'Constancia de Pensión CCSS', required: false },
    { key: 'constancia_pension_alimentaria', label: 'Constancia de Pensión Alimentaria', required: false },
    { key: 'constancia_estudio', label: 'Constancia de Estudio', required: false },
    { key: 'cuenta_banco_nacional', label: 'Cuenta Banco Nacional', required: false }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Formulario Completo - Fase 3</h2>
          <p className="text-gray-600">Complete toda la información requerida para su expediente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos Personales Completos */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Personales Completos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inscripción *
              </label>
              <input
                type="date"
                value={form.complete_personal_data.registration_date}
                onChange={(e) => handleChange('complete_personal_data', 'registration_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.full_name}
                onChange={(e) => handleChange('complete_personal_data', 'full_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cédula *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.cedula}
                onChange={(e) => handleChange('complete_personal_data', 'cedula', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo *
              </label>
              <select
                value={form.complete_personal_data.gender}
                onChange={(e) => handleChange('complete_personal_data', 'gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={form.complete_personal_data.birth_date}
                onChange={(e) => handleChange('complete_personal_data', 'birth_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lugar de Nacimiento *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.birth_place}
                onChange={(e) => handleChange('complete_personal_data', 'birth_place', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidad *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.nationality}
                onChange={(e) => handleChange('complete_personal_data', 'nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Principal *
              </label>
              <input
                type="tel"
                value={form.complete_personal_data.primary_phone}
                onChange={(e) => handleChange('complete_personal_data', 'primary_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Secundario
              </label>
              <input
                type="tel"
                value={form.complete_personal_data.secondary_phone}
                onChange={(e) => handleChange('complete_personal_data', 'secondary_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={form.complete_personal_data.email}
                onChange={(e) => handleChange('complete_personal_data', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección Exacta *
            </label>
            <textarea
              value={form.complete_personal_data.exact_address}
              onChange={(e) => handleChange('complete_personal_data', 'exact_address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.province}
                onChange={(e) => handleChange('complete_personal_data', 'province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distrito *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.district}
                onChange={(e) => handleChange('complete_personal_data', 'district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Información Familiar */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información Familiar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Madre *
              </label>
              <input
                type="text"
                value={form.family_information.mother_name}
                onChange={(e) => handleChange('family_information', 'mother_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cédula Madre *
              </label>
              <input
                type="text"
                value={form.family_information.mother_cedula}
                onChange={(e) => handleChange('family_information', 'mother_cedula', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ocupación de la Madre *
              </label>
              <input
                type="text"
                value={form.family_information.mother_occupation}
                onChange={(e) => handleChange('family_information', 'mother_occupation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de la Madre *
              </label>
              <input
                type="tel"
                value={form.family_information.mother_phone}
                onChange={(e) => handleChange('family_information', 'mother_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Padre *
              </label>
              <input
                type="text"
                value={form.family_information.father_name}
                onChange={(e) => handleChange('family_information', 'father_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cédula Padre *
              </label>
              <input
                type="text"
                value={form.family_information.father_cedula}
                onChange={(e) => handleChange('family_information', 'father_cedula', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ocupación del Padre *
              </label>
              <input
                type="text"
                value={form.family_information.father_occupation}
                onChange={(e) => handleChange('family_information', 'father_occupation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Padre *
              </label>
              <input
                type="tel"
                value={form.family_information.father_phone}
                onChange={(e) => handleChange('family_information', 'father_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Persona Responsable (si es diferente)
              </label>
              <input
                type="text"
                value={form.family_information.responsible_person}
                onChange={(e) => handleChange('family_information', 'responsible_person', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de la Persona Responsable
              </label>
              <input
                type="text"
                value={form.family_information.responsible_address}
                onChange={(e) => handleChange('family_information', 'responsible_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de la Persona Responsable
              </label>
              <input
                type="tel"
                value={form.family_information.responsible_phone}
                onChange={(e) => handleChange('family_information', 'responsible_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Datos de Discapacidad */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Discapacidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Discapacidad *
              </label>
              <select
                name="disability_type"
                value={form.disability_information.disability_type}
                onChange={(e) => handleChange('disability_information', 'disability_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="fisica">Física</option>
                <option value="visual">Visual</option>
                <option value="auditiva">Auditiva</option>
                <option value="psicosocial">Psicosocial</option>
                <option value="cognitiva">Cognitiva</option>
                <option value="intelectual">Intelectual</option>
                <option value="multiple">Múltiple</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dictamen Médico *
              </label>
              <textarea
                name="medical_diagnosis"
                value={form.disability_information.medical_diagnosis}
                onChange={(e) => handleChange('disability_information', 'medical_diagnosis', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del dictamen médico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Seguro *
              </label>
              <select
                name="insurance_type"
                value={form.disability_information.insurance_type}
                onChange={(e) => handleChange('disability_information', 'insurance_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="rnc">RnC</option>
                <option value="independiente">Independiente</option>
                <option value="privado">Privado</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origen de la Discapacidad *
              </label>
              <select
                name="disability_origin"
                value={form.disability_information.disability_origin}
                onChange={(e) => handleChange('disability_information', 'disability_origin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="nacimiento">Nacimiento</option>
                <option value="accidente">Accidente</option>
                <option value="enfermedad">Enfermedad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificado de Discapacidad *
              </label>
              <select
                name="disability_certificate"
                value={form.disability_information.disability_certificate}
                onChange={(e) => handleChange('disability_information', 'disability_certificate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="si">Sí</option>
                <option value="no">No</option>
                <option value="en_tramite">En trámite</option>
              </select>
            </div>
          </div>
        </div>



        {/* Ficha Socioeconómica */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ficha Socioeconómica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vivienda *
              </label>
              <select
                name="housing_type"
                value={form.socioeconomic_information.housing_type}
                onChange={(e) => handleChange('socioeconomic_information', 'housing_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="casa_propia">Casa propia</option>
                <option value="alquilada">Alquilada</option>
                <option value="prestada">Prestada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingreso Familiar Mensual *
              </label>
              <select
                name="family_income"
                value={form.socioeconomic_information.family_income}
                onChange={(e) => handleChange('socioeconomic_information', 'family_income', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="menos_200k">Menos de 200,000 colones</option>
                <option value="200k_400k">De 200,000 a 400,000 colones</option>
                <option value="400k_600k">De 400,000 a 600,000 colones</option>
                <option value="600k_800k">De 600,000 a 800,000 colones</option>
                <option value="800k_1m">De 800,000 a 1,000,000 colones</option>
                <option value="1m_1.3m">De 1,000,000 a 1,300,000 colones</option>
                <option value="mas_1.3m">Más de 1,300,000 colones</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicios Disponibles
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { key: 'luz', label: 'Luz' },
                { key: 'agua', label: 'Agua' },
                { key: 'telefono', label: 'Teléfono' },
                { key: 'alcantarillado', label: 'Alcantarillado' },
                { key: 'internet', label: 'Internet' }
              ].map((service) => (
                <div key={service.key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={service.key}
                    checked={form.socioeconomic_information.available_services.some(s => s.service === service.key)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const currentServices = form.socioeconomic_information.available_services;
                      
                      if (isChecked) {
                        // Add service
                        const newService: AvailableService = { service: service.key as AvailableService['service'] };
                        const updatedServices = [...currentServices, newService];
                        handleChange('socioeconomic_information', 'available_services', updatedServices);
                      } else {
                        // Remove service
                        const updatedServices = currentServices.filter(s => s.service !== service.key);
                        handleChange('socioeconomic_information', 'available_services', updatedServices);
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={service.key} className="ml-2 text-sm text-gray-700">
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Personas que Trabajan en la Familia
              </label>
              <button
                type="button"
                onClick={addWorkingFamilyMember}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Agregar Familiar
              </button>
            </div>
            <div className="space-y-3">
              {form.socioeconomic_information.working_family_members.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-gray-200 rounded">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={member.name}
                    onChange={(e) => updateWorkingFamilyMember(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Tipo de Trabajo"
                    value={member.work_type}
                    onChange={(e) => updateWorkingFamilyMember(index, 'work_type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Lugar de Trabajo"
                    value={member.work_place}
                    onChange={(e) => updateWorkingFamilyMember(index, 'work_place', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono del Trabajo"
                    value={member.work_phone}
                    onChange={(e) => updateWorkingFamilyMember(index, 'work_phone', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeWorkingFamilyMember(index)}
                    className="flex items-center justify-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.socioeconomic_information.working_family_members.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No hay familiares trabajando registrados. Haga clic en "Agregar Familiar" para comenzar.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subida de Documentos */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos Requeridos</h3>
          <div className="space-y-4">
            {documentTypes.map((doc) => (
              <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {doc.label} {doc.required && <span className="text-red-500">*</span>}
                  </label>
                  {documentFiles[doc.key] && (
                    <button
                      type="button"
                      onClick={() => handleDocumentChange(doc.key, null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  onChange={(e) => handleDocumentChange(doc.key, e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  required={doc.required}
                />
                {documentFiles[doc.key] && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {documentFiles[doc.key]?.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

     


        {/* Documentación y Requisitos */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documentación y Requisitos</h3>
          
          {/* Información de pago */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h4 className="font-medium text-blue-900">Información de Pago</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Para completar su expediente, debe realizar el pago de la cuota de afiliación de <strong>500 colones</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Estado del Pago
                </label>
                <select
                  value={form.documentation_requirements.affiliation_fee}
                  onChange={(e) => handleChange('documentation_requirements', 'affiliation_fee', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Información Bancaria
                </label>
                <input
                  type="text"
                  value={form.documentation_requirements.banking_information}
                  onChange={(e) => handleChange('documentation_requirements', 'banking_information', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de cuenta, referencia, etc."
                />
              </div>
            </div>
          </div>

          {/* Lista de documentos requeridos */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 mb-3">Documentos Requeridos</h4>
            {[
              { key: 'dictamen_medico', label: 'Dictamen Médico', required: true },
              { key: 'constancia_nacimiento', label: 'Constancia de Nacimiento', required: true },
              { key: 'copia_cedula', label: 'Copia de Cédula (solicitante)', required: true },
              { key: 'copias_cedulas_familia', label: 'Copias de Cédulas (familia)', required: true },
              { key: 'foto_pasaporte', label: 'Foto Tamaño Pasaporte', required: true },
              { key: 'constancia_pension_ccss', label: 'Constancia de Pensión CCSS', required: false },
              { key: 'constancia_pension_alimentaria', label: 'Constancia de Pensión Alimentaria', required: false },
              { key: 'constancia_estudio', label: 'Constancia de Estudio', required: false },
              { key: 'cuenta_banco_nacional', label: 'Cuenta Banco Nacional', required: false }
            ].map((req) => (
              <div key={req.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${req.required ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                  <label className="text-sm text-gray-700">
                    {req.label} {req.required && <span className="text-red-500">*</span>}
                  </label>
                </div>
                <select 
                  className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
                  onChange={(e) => {
                    const status = e.target.value as 'entregado' | 'pendiente' | 'en_tramite' | 'no_aplica';
                    const existingDoc = form.documentation_requirements.documents.find(doc => doc.document_type === req.key);
                    
                    if (existingDoc) {
                      // Update existing document
                      const updatedDocs = form.documentation_requirements.documents.map(doc => 
                        doc.document_type === req.key ? { ...doc, status } : doc
                      );
                      handleChange('documentation_requirements', 'documents', updatedDocs);
                    } else {
                                             // Add new document
                       const newDoc: RequiredDocument = {
                         document_type: req.key as RequiredDocument['document_type'],
                         status,
                         observations: ''
                       };
                      const updatedDocs = [...form.documentation_requirements.documents, newDoc];
                      handleChange('documentation_requirements', 'documents', updatedDocs);
                    }
                  }}
                  value={form.documentation_requirements.documents.find(doc => doc.document_type === req.key)?.status || 'pendiente'}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="entregado">Entregado</option>
                  <option value="en_tramite">En trámite</option>
                  <option value="no_aplica">No aplica</option>
                </select>
              </div>
            ))}
          </div>

          {/* Resumen de documentos */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Resumen de Documentación</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {form.documentation_requirements.documents.filter(doc => doc.status === 'entregado').length}
                </div>
                <div className="text-gray-600">Entregados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {form.documentation_requirements.documents.filter(doc => doc.status === 'pendiente' || doc.status === 'en_tramite').length}
                </div>
                <div className="text-gray-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {form.documentation_requirements.documents.filter(doc => doc.status === 'no_aplica').length}
                </div>
                <div className="text-gray-600">No Aplican</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones Generales
            </label>
            <textarea
              value={form.documentation_requirements.general_observations}
              onChange={(e) => handleChange('documentation_requirements', 'general_observations', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones generales"
            />
          </div>
        </div>

           {/* Botón de envío */}
           <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Completar Expediente
              </>
            )}
          </button>
        </div>
      </form>
    </div>

    
  );
};

export default Phase3Form;
