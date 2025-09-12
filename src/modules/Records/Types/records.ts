// Tipos para el sistema de expedientes de ASONIPED

export interface PersonalData {
  id?: number;
  record_id?: number;
  full_name: string;
  pcd_name: string;
  cedula: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  birth_place: string;
  address: string;
  province: string;
  canton?: string;
  district: string;
  phone?: string;
  email?: string;
  mother_name?: string;
  mother_cedula?: string;
  mother_occupation?: string;
  mother_phone?: string;
  father_name?: string;
  father_cedula?: string;
  father_occupation?: string;
  father_phone?: string;
  legal_guardian_name?: string;
  legal_guardian_cedula?: string;
  legal_guardian_occupation?: string;
  legal_guardian_phone?: string;
  created_at?: string;
  updated_at?: string;
}

// Datos personales completos para Fase 3
export interface CompletePersonalData {
  id?: number;
  record_id?: number;
  record_number?: string;
  registration_date: string;
  full_name: string;
  pcd_name?: string; // Nombre de la persona con discapacidad
  cedula: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  age?: number; // Calculado automáticamente
  birth_place: string;
  exact_address: string;
  province: string;
  canton?: string; // Added canton field
  district: string;
  primary_phone: string;
  secondary_phone?: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Información familiar
export interface FamilyInformation {
  id?: number;
  record_id?: number;
  mother_name: string;
  mother_cedula: string;
  mother_occupation: string;
  mother_phone: string;
  father_name: string;
  father_cedula: string;
  father_occupation: string;
  father_phone: string;
  responsible_person?: string;
  responsible_address?: string;
  responsible_cedula?: string;
  responsible_occupation?: string;
  responsible_phone?: string;
  family_members: FamilyMember[];
  created_at?: string;
  updated_at?: string;
}

export interface FamilyMember {
  id?: number;
  family_info_id?: number;
  name: string;
  age: number;
  relationship: string;
  occupation: string;
  marital_status: string;
}

// Información de discapacidad actualizada
export interface DisabilityInformation {
  id?: number;
  record_id?: number;
  disability_type: 'fisica' | 'visual' | 'auditiva' | 'psicosocial' | 'cognitiva' | 'intelectual' | 'multiple';
  medical_diagnosis: string;
  insurance_type: 'rnc' | 'independiente' | 'privado' | 'otro';
  disability_origin: 'nacimiento' | 'accidente' | 'enfermedad';
  disability_certificate: 'si' | 'no' | 'en_tramite';
  conapdis_registration: 'si' | 'no' | 'en_tramite';
  medical_additional: MedicalAdditionalInfo;
  created_at?: string;
  updated_at?: string;
}

export interface BiomechanicalBenefit {
  id?: number;
  disability_info_id?: number;
  type: 'silla_ruedas' | 'baston' | 'andadera' | 'audifono' | 'baston_guia' | 'otro';
  other_description?: string;
}

export interface PermanentLimitation {
  id?: number;
  disability_info_id?: number;
  limitation: 'moverse_caminar' | 'ver_lentes' | 'oir_audifono' | 'comunicarse_hablar' | 'entender_aprender' | 'relacionarse';
  degree: 'leve' | 'moderada' | 'severa' | 'no_se_sabe';
  observations?: string;
}

export interface MedicalAdditionalInfo {
  id?: number;
  disability_info_id?: number;
  diseases: string;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  biomechanical_benefit: BiomechanicalBenefit[];
  permanent_limitations: PermanentLimitation[];
  medical_observations?: string;
}

// Información socioeconómica actualizada
export interface SocioeconomicInformation {
  id?: number;
  record_id?: number;
  housing_type: 'casa_propia' | 'alquilada' | 'prestada';
  available_services: AvailableService[];
  family_income: 'menos_200k' | '200k_400k' | '400k_600k' | '600k_800k' | '800k_1000k' | '1000k_1300k' | 'mas_1300k';
  working_family_members: WorkingFamilyMember[];
  created_at?: string;
  updated_at?: string;
}

export interface AvailableService {
  id?: number;
  socioeconomic_info_id?: number;
  service: 'luz' | 'agua' | 'telefono' | 'alcantarillado' | 'internet';
}

export interface WorkingFamilyMember {
  id?: number;
  socioeconomic_info_id?: number;
  name: string;
  work_type: string;
  work_place: string;
  work_phone: string;
}

// Documentación y requisitos
export interface DocumentationRequirements {
  id?: number;
  record_id?: number;
  documents: RequiredDocument[];
  affiliation_fee_paid?: boolean;
  bank_account_info?: string;
  general_observations: string;
  signatures: FormSignatures;
  created_at?: string;
  updated_at?: string;
}

export interface RequiredDocument {
  id?: number;
  documentation_id?: number;
  document_type: 'dictamen_medico' | 'constancia_nacimiento' | 'copia_cedula' | 'copias_cedulas_familia' | 'foto_pasaporte' | 'constancia_pension_ccss' | 'constancia_pension_alimentaria' | 'constancia_estudio' | 'cuenta_banco_nacional';
  status: 'entregado' | 'pendiente' | 'en_tramite' | 'no_aplica';
  observations?: string;
}

export interface FormSignatures {
  id?: number;
  documentation_id?: number;
  applicant_signature?: string;
  applicant_date?: string;
  parent_signature?: string;
  parent_date?: string;
  receiver_signature?: string;
  receiver_date?: string;
}

// Control administrativo
export interface AdministrativeControl {
  id?: number;
  record_id?: number;
  reviewed_by?: string;
  review_date?: string;
  record_status: 'borrador' | 'en_revision' | 'aprobado' | 'rechazado' | 'inactivo';
  administrative_observations?: string;
  next_review?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecordDocument {
  id?: number;
  record_id: number;
  document_type: 'medical_diagnosis' | 'birth_certificate' | 'cedula' | 'photo' | 'pension_certificate' | 'study_certificate' | 'other';
  file_path: string;
  file_name: string;
  file_size: number;
  original_name: string;
  uploaded_by?: number;
  uploaded_at?: string;
}

export interface RecordNote {
  id?: number;
  record_id: number;
  note: string;
  type: 'note' | 'activity' | 'milestone';
  created_by?: number;
  created_at?: string;
}

export interface Record {
  id: number;
  record_number: string;
  status: 'draft' | 'pending' | 'needs_modification' | 'approved' | 'rejected' | 'active' | 'inactive';
  phase: 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'completed';
  created_at: string;
  updated_at: string;
  created_by?: number;
  // Datos relacionados
  personal_data?: PersonalData;
  complete_personal_data?: CompletePersonalData;
  family_information?: FamilyInformation;
  disability_information?: DisabilityInformation;
  socioeconomic_information?: SocioeconomicInformation;
  documentation_requirements?: DocumentationRequirements;
  administrative_control?: AdministrativeControl;
  documents?: RecordDocument[];
  notes?: RecordNote[];
}

export interface RecordWithDetails extends Record {
  personal_data?: PersonalData;
  complete_personal_data?: CompletePersonalData;
  family_information?: FamilyInformation;
  disability_information?: DisabilityInformation;
  disability_data?: any; // Add this line
  socioeconomic_information?: SocioeconomicInformation;
  socioeconomic_data?: any; // Add this line
  documentation_requirements?: DocumentationRequirements;
  registration_requirements?: any;
  administrative_control?: AdministrativeControl;
  enrollment_form?: any;
  documents: RecordDocument[];
  notes: RecordNote[];
}

// Tipos para las fases del proceso
export interface Phase1Data {
  full_name: string;
  pcd_name: 'fisica' | 'visual' | 'auditiva' | 'psicosocial' | 'cognitiva' | 'intelectual' | 'multiple';
  cedula: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  birth_place: string;
  address: string;
  province: string;
  canton: string;
  district: string;
  phone?: string;
  mother_name?: string;
  mother_cedula?: string;
  mother_phone?: string;
  father_name?: string;
  father_cedula?: string;
  father_phone?: string;
  legal_guardian_name?: string;
  legal_guardian_cedula?: string;
  legal_guardian_phone?: string;
}

export interface Phase3Data {
  complete_personal_data: Omit<CompletePersonalData, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  family_information: Omit<FamilyInformation, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  disability_information: Omit<DisabilityInformation, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  socioeconomic_information: Omit<SocioeconomicInformation, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  documentation_requirements: Omit<DocumentationRequirements, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  documents: File[];
}

// Tipos para respuestas de API
export interface RecordsResponse {
  records: Record[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecordStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  inactive: number;
  thisMonth: number;
  phase1: number;
  phase2: number;
  phase3: number;
  phase4: number;
  completed: number;
}
