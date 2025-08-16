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
  district: string;
  mother_name: string;
  mother_cedula: string;
  father_name: string;
  father_cedula: string;
  created_at?: string;
  updated_at?: string;
}

export interface DisabilityData {
  id?: number;
  record_id?: number;
  disability_type: string;
  diagnosis_date: string;
  medical_center: string;
  doctor_name: string;
  severity_level: 'mild' | 'moderate' | 'severe';
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegistrationRequirements {
  id?: number;
  record_id?: number;
  birth_certificate: boolean;
  cedula_copy: boolean;
  medical_diagnosis: boolean;
  photo: boolean;
  pension_certificate?: boolean;
  study_certificate?: boolean;
  other_documents?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnrollmentForm {
  id?: number;
  record_id?: number;
  enrollment_date: string;
  program_type: string;
  special_needs: string;
  emergency_contact: string;
  emergency_phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface SocioeconomicData {
  id?: number;
  record_id?: number;
  family_income: number;
  family_members: number;
  housing_type: string;
  education_level: string;
  employment_status: string;
  social_programs: string[];
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
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  phase: 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'completed';
  created_at: string;
  updated_at: string;
  created_by?: number;
  // Datos relacionados
  personal_data?: PersonalData;
  disability_data?: DisabilityData;
  registration_requirements?: RegistrationRequirements;
  enrollment_form?: EnrollmentForm;
  socioeconomic_data?: SocioeconomicData;
  documents?: RecordDocument[];
  notes?: RecordNote[];
}

export interface RecordWithDetails extends Record {
  personal_data: PersonalData | null;
  disability_data: DisabilityData | null;
  registration_requirements: RegistrationRequirements | null;
  enrollment_form: EnrollmentForm | null;
  socioeconomic_data: SocioeconomicData | null;
  documents: RecordDocument[];
  notes: RecordNote[];
}

// Tipos para las fases del proceso
export interface Phase1Data {
  full_name: string;
  pcd_name: string;
  cedula: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  birth_place: string;
  address: string;
  province: string;
  district: string;
  mother_name: string;
  mother_cedula: string;
  father_name: string;
  father_cedula: string;
}

export interface Phase3Data {
  disability_data: Omit<DisabilityData, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  registration_requirements: Omit<RegistrationRequirements, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  enrollment_form: Omit<EnrollmentForm, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  socioeconomic_data: Omit<SocioeconomicData, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
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
