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
  mother_name: string;
  mother_cedula: string;
  mother_phone?: string;
  mother_occupation?: string;
  father_name: string;
  father_cedula: string;
  father_phone?: string;
  father_occupation?: string;
  legal_guardian_name?: string;
  legal_guardian_cedula?: string;
  legal_guardian_phone?: string;
  legal_guardian_occupation?: string;
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

/** Códigos permitidos para tipo(s) de discapacidad (BD: lista separada por comas). */
export type DisabilityTypeOption =
  | 'fisica'
  | 'visual'
  | 'auditiva'
  | 'psicosocial'
  | 'cognitiva'
  | 'intelectual'
  | 'multiple';

const DISABILITY_TYPE_CODES = new Set<string>([
  'fisica',
  'visual',
  'auditiva',
  'psicosocial',
  'cognitiva',
  'intelectual',
  'multiple'
]);

export const DISABILITY_TYPE_OPTIONS: { value: DisabilityTypeOption; label: string }[] = [
  { value: 'fisica', label: 'Física' },
  { value: 'visual', label: 'Visual' },
  { value: 'auditiva', label: 'Auditiva' },
  { value: 'psicosocial', label: 'Psicosocial' },
  { value: 'cognitiva', label: 'Cognitiva' },
  { value: 'intelectual', label: 'Intelectual' },
  { value: 'multiple', label: 'Múltiple' }
];

const DISABILITY_TYPE_LABEL: { [K in DisabilityTypeOption]: string } = {
  fisica: 'Física',
  visual: 'Visual',
  auditiva: 'Auditiva',
  psicosocial: 'Psicosocial',
  cognitiva: 'Cognitiva',
  intelectual: 'Intelectual',
  multiple: 'Múltiple'
};

/** Normaliza entrada de API (string con comas) o del formulario (array) a códigos únicos válidos. */
export function normalizeDisabilityTypes(input: unknown): DisabilityTypeOption[] {
  const out: DisabilityTypeOption[] = [];
  const add = (token: string) => {
    const s = token.trim().toLowerCase();
    if (!DISABILITY_TYPE_CODES.has(s)) return;
    const v = s as DisabilityTypeOption;
    if (!out.includes(v)) out.push(v);
  };
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') add(item);
    }
    return out;
  }
  if (typeof input === 'string' && input.trim()) {
    for (const part of input.split(',')) add(part);
    return out;
  }
  return [];
}

/** Etiquetas en español separadas por coma; cadena vacía si no hay códigos válidos. */
export function formatDisabilityTypesSpanish(input: unknown): string {
  return normalizeDisabilityTypes(input)
    .map((t) => DISABILITY_TYPE_LABEL[t])
    .join(', ');
}

// Información de discapacidad actualizada
export interface DisabilityInformation {
  id?: number;
  record_id?: number;
  disability_type: DisabilityTypeOption[];
  medical_diagnosis: string;
  /** Vacío en el formulario hasta que el usuario elija; la API guarda solo valores válidos. */
  insurance_type: 'rnc' | 'independiente' | 'privado' | 'otro' | '';
  /** Vacío en el formulario hasta que el usuario elija. */
  disability_origin: 'nacimiento' | 'accidente' | 'enfermedad' | '';
  disability_certificate: 'si' | 'no' | 'en_tramite' | '';
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
  /** Vacío en el formulario hasta que el usuario elija. */
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
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
  /** Present on client when user selects a file for upload (not from API JSON). */
  file?: File;
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
  file_path: string; // Legacy field - now contains Google Drive URL
  file_name: string; // Legacy field - now contains Google Drive filename
  file_size: number;
  original_name: string;
  uploaded_by?: number;
  uploaded_at?: string;
  // Google Drive fields
  google_drive_id?: string;
  google_drive_url?: string;
  google_drive_name?: string;
}

export interface RecordNote {
  id?: number;
  record_id: number;
  note: string;
  type: 'note' | 'activity' | 'milestone';
  // Optional denormalized creator name for display purposes
  created_by_name?: string;
  created_by?: number;
  created_at?: string;
}

/** API mirror of disability fields when nested under `disability_data` instead of `disability_information`. */
export type DisabilityDataPayload = Partial<DisabilityInformation>;

/** API mirror of socioeconomic fields when nested under `socioeconomic_data`. */
export type SocioeconomicDataPayload = Partial<SocioeconomicInformation>;

/** Registration / documentation bundle returned by some record endpoints. */
export interface RegistrationRequirementsPayload {
  affiliation_fee_paid?: boolean;
  bank_account_info?: string;
  general_observations?: string;
  /** JSON string or parsed array of per-document statuses */
  document_statuses?: unknown;
  [key: string]: unknown;
}

/** Boleta de matrícula / enrollment block from API. */
export interface EnrollmentFormPayload {
  enrollment_date?: string;
  applicant_full_name?: string;
  applicant_cedula?: string;
  emergency_phones?: string;
  [key: string]: unknown;
}

export interface Record {
  id: number;
  record_number: string;
  status: 'draft' | 'pending' | 'needs_modification' | 'approved' | 'rejected' | 'active' | 'inactive';
  phase: 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'completed';
  created_at: string;
  updated_at: string;
  created_by?: number;
  admin_created?: boolean;
  // Creator attribution information
  creator_username?: string;
  creator_full_name?: string;
  // Handover tracking fields
  handed_over_to_user?: boolean;
  handed_over_to?: number;
  handed_over_at?: string;
  handed_over_by?: number;
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
  disability_data?: DisabilityDataPayload;
  socioeconomic_information?: SocioeconomicInformation;
  socioeconomic_data?: SocioeconomicDataPayload;
  documentation_requirements?: DocumentationRequirements;
  registration_requirements?: RegistrationRequirementsPayload;
  administrative_control?: AdministrativeControl;
  enrollment_form?: EnrollmentFormPayload;
  documents: RecordDocument[];
  notes: RecordNote[];
}

// Tipos para las fases del proceso
export interface Phase1Data {
  full_name: string;
  /** Códigos separados por coma; mismo formato que usa `normalizeDisabilityTypes`. */
  pcd_name: string;
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
  mother_occupation?: string;
  father_name?: string;
  father_cedula?: string;
  father_phone?: string;
  father_occupation?: string;
  legal_guardian_name?: string;
  legal_guardian_cedula?: string;
  legal_guardian_phone?: string;
  legal_guardian_occupation?: string;
}

export interface Phase3Data {
  complete_personal_data: Omit<CompletePersonalData, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  family_information: Omit<FamilyInformation, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  disability_information: Omit<DisabilityInformation, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  socioeconomic_information: Omit<SocioeconomicInformation, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  documentation_requirements: Omit<DocumentationRequirements, 'id' | 'record_id' | 'created_at' | 'updated_at'>;
  documents: File[];
  /** File name → form/backend document field key (set by Phase3Form on submit) */
  documentTypes?: { [fileName: string]: string };
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

/** Stored in `general_observations` TEXT as JSON `string[]` or legacy plain string. */
export const MAX_GENERAL_OBSERVATION_NOTE_LENGTH = 200;
export const MAX_GENERAL_OBSERVATION_NOTE_COUNT = 10;
export const GENERAL_OBSERVATIONS_CHAR_PATTERN = /^[0-9a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-]*$/;

export function parseGeneralObservationsStored(raw: string | undefined | null): string[] {
  if (raw == null || String(raw).trim() === '') return [];
  const str = String(raw);
  try {
    const parsed = JSON.parse(str) as unknown;
    if (Array.isArray(parsed) && parsed.every((x): x is string => typeof x === 'string')) {
      return parsed;
    }
  } catch {
    /* legacy plain text */
  }
  return [str];
}

export function serializeGeneralObservationsStored(rows: string[]): string {
  if (rows.length === 0) return '';
  const anyContent = rows.some((r) => r.trim().length > 0);
  if (rows.length === 1 && !anyContent) return '';
  return JSON.stringify(rows);
}
