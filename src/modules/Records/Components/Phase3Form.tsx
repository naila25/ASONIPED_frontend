import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Upload, X, Plus, Trash2, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { Phase3Data, RecordWithDetails, RequiredDocument, AvailableService, FamilyInformation, DisabilityTypeOption, WorkingFamilyMember } from '../Types/records';
import {
  DISABILITY_TYPE_OPTIONS,
  normalizeDisabilityTypes,
  parseGeneralObservationsStored,
  serializeGeneralObservationsStored,
  MAX_GENERAL_OBSERVATION_NOTE_LENGTH,
  MAX_GENERAL_OBSERVATION_NOTE_COUNT,
  GENERAL_OBSERVATIONS_CHAR_PATTERN
} from '../Types/records';
import { useAuth } from '../../Login/Hooks/useAuth';
import { getProvinces, getCantonsByProvince, getDistrictsByCanton, type Province, type Canton, type District } from '../Services/geographicApi';

const WORKING_FAMILY_MEMBER_NAME_MIN = 5;
const WORKING_FAMILY_MEMBER_NAME_MAX = 40;
const WORKING_FAMILY_WORK_FIELD_MAX = 40;
const WORKING_FAMILY_PHONE_DIGITS_MAX = 8;

/** Errores por campo por cada fila de “Personas que trabajan en la familia”. */
type WorkingMemberFieldErrors = {
  name?: string;
  work_type?: string;
  work_place?: string;
  work_phone?: string;
};

function validateWorkingFamilyMemberRow(m: WorkingFamilyMember): WorkingMemberFieldErrors {
  const err: WorkingMemberFieldErrors = {};
  const name = (m.name || '').trim();
  if (!name) err.name = 'Este campo es obligatorio.';
  else if (name.length < WORKING_FAMILY_MEMBER_NAME_MIN)
    err.name = `Mínimo ${WORKING_FAMILY_MEMBER_NAME_MIN} caracteres.`;
  else if (name.length > WORKING_FAMILY_MEMBER_NAME_MAX)
    err.name = `Máximo ${WORKING_FAMILY_MEMBER_NAME_MAX} caracteres.`;
  else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'.-]+$/.test(name)) err.name = 'Solo letras y espacios.';

  const wt = (m.work_type || '').trim();
  if (!wt) err.work_type = 'Este campo es obligatorio.';
  else if (wt.length > WORKING_FAMILY_WORK_FIELD_MAX)
    err.work_type = `Máximo ${WORKING_FAMILY_WORK_FIELD_MAX} caracteres.`;

  const wplace = (m.work_place || '').trim();
  if (!wplace) err.work_place = 'Este campo es obligatorio.';
  else if (wplace.length > WORKING_FAMILY_WORK_FIELD_MAX)
    err.work_place = `Máximo ${WORKING_FAMILY_WORK_FIELD_MAX} caracteres.`;

  const phoneDigits = (m.work_phone || '').replace(/\D/g, '');
  if (!phoneDigits) err.work_phone = 'Este campo es obligatorio.';
  else if (!new RegExp(`^\\d{${WORKING_FAMILY_PHONE_DIGITS_MAX}}$`).test(phoneDigits))
    err.work_phone = `Use ${WORKING_FAMILY_PHONE_DIGITS_MAX} dígitos (ej. 88888888).`;

  return err;
}

function validateAllWorkingFamilyMembers(members: WorkingFamilyMember[]): {
  ok: boolean;
  errors: WorkingMemberFieldErrors[];
} {
  const errors = members.map(validateWorkingFamilyMemberRow);
  const ok = errors.every((e) => !e.name && !e.work_type && !e.work_place && !e.work_phone);
  return { ok, errors };
}

const WORKING_MEMBER_FIELD_LABELS: Record<keyof WorkingMemberFieldErrors, string> = {
  name: 'Nombre completo',
  work_type: 'Tipo de trabajo',
  work_place: 'Lugar de trabajo',
  work_phone: 'Teléfono'
};

function formatWorkingFamilyRowIssues(errors: WorkingMemberFieldErrors[]): string[] {
  const items: string[] = [];
  errors.forEach((rowErr, idx) => {
    (Object.keys(rowErr) as (keyof WorkingMemberFieldErrors)[]).forEach((key) => {
      const msg = rowErr[key];
      if (msg) {
        items.push(`Persona ${idx + 1} (${WORKING_MEMBER_FIELD_LABELS[key]}): ${msg}`);
      }
    });
  });
  return items;
}

/** Grouped issues for the final-step submission checklist (paso → detalle). */
type FinalSubmitGap = { stepIndex: number; stepLabel: string; items: string[] };

function isWorkingFamilyMemberRowValid(m: WorkingFamilyMember): boolean {
  const e = validateWorkingFamilyMemberRow(m);
  return !e.name && !e.work_type && !e.work_place && !e.work_phone;
}

/** Cleared file slots — keep keys in sync with resetTrigger / backend mapping. */
const EMPTY_PHASE3_DOCUMENT_FILES: Record<string, File | null> = {
  dictamen_medico: null,
  constancia_nacimiento: null,
  copia_cedula: null,
  copias_cedulas_familia: null,
  foto_pasaporte: null,
  constancia_pension_ccss: null,
  constancia_pension_alimentaria: null,
  constancia_estudio: null,
  cuenta_banco_nacional: null,
  informacion_pago: null,
  otros: null
};

/** Extra uploads: unique multipart filename so `documentTypes` map stays unambiguous. */
function buildUniqueExtraFile(id: string, title: string, file: File): File {
  const originalName = file.name || 'documento';
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
  const safe = (title.trim() || 'documento')
    .replace(/[^\w\u00C0-\u024F\s-]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 35);
  const name = `extra_${id.replace(/-/g, '').slice(0, 12)}_${safe}_${Date.now()}${ext}`;
  return new File([file], name, { type: file.type, lastModified: file.lastModified });
}

type ExtraDocumentRow = { id: string; title: string; file: File | null };

const MAX_RECORD_UPLOAD_FILES = 10;

interface Phase3FormProps {
  onSubmit: (data: Phase3Data) => void;
  loading: boolean;
  currentRecord?: RecordWithDetails | null;
  uploadProgress?: number;
  isModification?: boolean;
  isAdminCreation?: boolean;
  isAdminEdit?: boolean;
  modificationDetails?: {
    sections: string[];
    documents: number[];
    comment: string;
  } | null;
  resetTrigger?: number; // Add reset trigger prop
  /** Set when submit/upload fails so the user sees the message on the final step before retrying documents. */
  submitError?: string | null;
  onClearSubmitError?: () => void;
}

const Phase3Form: React.FC<Phase3FormProps> = ({
  onSubmit,
  loading,
  currentRecord = null,
  uploadProgress = 0,
  isModification = false,
  isAdminCreation = false,
  isAdminEdit = false,
  modificationDetails = null,
  resetTrigger = 0,
  submitError = null,
  onClearSubmitError
}) => {
  const { user } = useAuth();

  const birthDateLimits = useMemo(() => {
    const today = new Date();
    const max = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 120);
    const min = minDate.toISOString().slice(0, 10);
    return { min, max };
  }, []);

  // Geographic data state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Validación y estados de error para expediente 1 phase3
  const [fullNameError, setFullNameError] = useState('');
  const [fullNameCharsLeft, setFullNameCharsLeft] = useState(40);

  const [primaryPhoneError, setPrimaryPhoneError] = useState('');
  const [primaryPhoneCharsLeft, setPrimaryPhoneCharsLeft] = useState(8);

  const [secondaryPhoneError, setSecondaryPhoneError] = useState('');
  const [secondaryPhoneCharsLeft, setSecondaryPhoneCharsLeft] = useState(8);

  const [cedulaError, setCedulaError] = useState('');
  const [cedulaCharsLeft, setCedulaCharsLeft] = useState(13);

  const [birthPlaceError, setBirthPlaceError] = useState('');
  const [birthPlaceCharsLeft, setBirthPlaceCharsLeft] = useState(40);

  const [emailError, setEmailError] = useState('');
  const [emailCharsLeft, setEmailCharsLeft] = useState(50);

  const [addressError, setAddressError] = useState('');
  const [addressCharsLeft, setAddressCharsLeft] = useState(150);

  const [birthDateError, setBirthDateError] = useState('');
  const [locationStepError, setLocationStepError] = useState('');

  // === Validaciones para Información Familiar ===

  // Madre
  const [motherNameError, setMotherNameError] = useState('');
  const [motherNameCharsLeft, setMotherNameCharsLeft] = useState(40);

  const [motherCedulaError, setMotherCedulaError] = useState('');
  const [motherCedulaCharsLeft, setMotherCedulaCharsLeft] = useState(13);

  const [motherOccupationError, setMotherOccupationError] = useState('');
  const [motherOccupationCharsLeft, setMotherOccupationCharsLeft] = useState(40);

  const [motherPhoneError, setMotherPhoneError] = useState('');
  const [motherPhoneCharsLeft, setMotherPhoneCharsLeft] = useState(8);

  // Padre
  const [fatherNameError, setFatherNameError] = useState('');
  const [fatherNameCharsLeft, setFatherNameCharsLeft] = useState(40);

  const [fatherCedulaError, setFatherCedulaError] = useState('');
  const [fatherCedulaCharsLeft, setFatherCedulaCharsLeft] = useState(13);

  const [fatherOccupationError, setFatherOccupationError] = useState('');
  const [fatherOccupationCharsLeft, setFatherOccupationCharsLeft] = useState(40);

  const [fatherPhoneError, setFatherPhoneError] = useState('');
  const [fatherPhoneCharsLeft, setFatherPhoneCharsLeft] = useState(8);

  // === Validaciones para Encargado Legal ===

  const [responsibleNameError, setResponsibleNameError] = useState('');
  const [responsibleNameCharsLeft, setResponsibleNameCharsLeft] = useState(40);

  const [responsibleCedulaError, setResponsibleCedulaError] = useState('');
  const [responsibleCedulaCharsLeft, setResponsibleCedulaCharsLeft] = useState(13);

  const [responsibleOccupationError, setResponsibleOccupationError] = useState('');
  const [responsibleOccupationCharsLeft, setResponsibleOccupationCharsLeft] = useState(40);

  const [responsiblePhoneError, setResponsiblePhoneError] = useState('');
  const [responsiblePhoneCharsLeft, setResponsiblePhoneCharsLeft] = useState(8);

  // === Validaciones para Información Médica ===
  const [diseasesError, setDiseasesError] = useState('');
  const [diseasesCharsLeft, setDiseasesCharsLeft] = useState(50);
  const [disabilityTypesError, setDisabilityTypesError] = useState('');
  const [insuranceTypeError, setInsuranceTypeError] = useState('');
  const [disabilityOriginError, setDisabilityOriginError] = useState('');
  const [disabilityCertificateError, setDisabilityCertificateError] = useState('');
  const [workingFamilyMemberErrors, setWorkingFamilyMemberErrors] = useState<WorkingMemberFieldErrors[]>([]);
  /** Controlled value for the optional "add another type" select (always reset after pick). */
  const [disabilityTypeAddMore, setDisabilityTypeAddMore] = useState('');
  /** Second dropdown is hidden until the user chooses to add another disability type. */
  const [showDisabilityTypeAddMore, setShowDisabilityTypeAddMore] = useState(false);

  // observaciones generales
  const [generalObservationsError, setGeneralObservationsError] = useState('');
  const [generalObsRowErrors, setGeneralObsRowErrors] = useState<Record<number, string>>({});
  const [documentsStepError, setDocumentsStepError] = useState('');
  const [finalSubmitGaps, setFinalSubmitGaps] = useState<FinalSubmitGap[] | null>(null);
  const [familyBlockError, setFamilyBlockError] = useState('');

  // Helper function to check if a section needs modification
  const needsModification = (sectionName: string): boolean => {
    if (!isModification || !modificationDetails) return false;
    return modificationDetails.sections.includes(sectionName);
  };

  // Helper function to check if a document needs replacement
  // const needsDocumentReplacement = (documentId: number): boolean => {
  //   if (!isModification || !modificationDetails) return false;
  //   return modificationDetails.documents.includes(documentId);
  // };

  // Family information display mode
  const [showParents, setShowParents] = useState(true);
  const [showLegalGuardian, setShowLegalGuardian] = useState(false);
  const [motherSectionOpen, setMotherSectionOpen] = useState(true);
  const [fatherSectionOpen, setFatherSectionOpen] = useState(true);

  // Multi-step form: 0 = Personal, 1 = Family, 2 = Disability+Medical, 3 = Socioeconomic, 4 = Documents
  const TOTAL_STEPS = 6;
  const LAST_STEP_INDEX = TOTAL_STEPS - 1; // 5 = Requisitos y Pago (only step that submits)
  const STEP_LABELS = ['Datos Personales', 'Familiar', 'Discapacidad', 'Socioeconómica', 'Documentos', 'Requisitos'];
  const [currentStep, setCurrentStep] = useState(0);
  const STEPS_VISIBLE = 3; // carousel window size
  const [stepperViewStart, setStepperViewStart] = useState(0);

  // Initial form state
  const getInitialFormState = (): Phase3Data => ({
    complete_personal_data: {
      registration_date: new Date().toISOString().split('T')[0],
      full_name: '',
      cedula: '',
      gender: 'male',
      birth_date: '',
      birth_place: '',
      exact_address: '',
      province: '',
      canton: '',
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
      responsible_occupation: '',
      responsible_phone: '',
      family_members: [],
      responsible_cedula: ''
    } as FamilyInformation & { responsible_cedula: string },
    disability_information: {
      disability_type: [] as DisabilityTypeOption[],
      medical_diagnosis: '',
      insurance_type: '',
      disability_origin: '',
      disability_certificate: '',
      conapdis_registration: 'no',
      medical_additional: {
        diseases: '',
        blood_type: '',
        biomechanical_benefit: [],
        permanent_limitations: [],
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
      affiliation_fee_paid: false,
      bank_account_info: '', // Keep for backward compatibility, but not used in UI
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

  const [form, setForm] = useState<Phase3Data>(getInitialFormState());

  /** Al menos un padre/madre (nombre válido) o encargado legal (nombre válido). */
  const familyPathCompletion = useMemo(() => {
    const isDisplayNameValid = (s: string) => {
      const t = (s || '').trim();
      return t.length >= 5 && t.length <= 40 && /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(t);
    };
    const m = (form.family_information.mother_name ?? '').trim();
    const f = (form.family_information.father_name ?? '').trim();
    const r = (form.family_information.responsible_person ?? '').trim();
    const motherNameValid = m.length > 0 && isDisplayNameValid(m);
    const fatherNameValid = f.length > 0 && isDisplayNameValid(f);
    const guardianNameValid = r.length > 0 && isDisplayNameValid(r);
    const hasParentPathComplete = motherNameValid || fatherNameValid;
    const hasGuardianPathComplete = guardianNameValid;
    // Si ya hay un padre/madre válido o el encargado, el otro progenitor pasa a opcional.
    const motherFieldsOptional = fatherNameValid || hasGuardianPathComplete;
    const fatherFieldsOptional = motherNameValid || hasGuardianPathComplete;
    return {
      hasParentPathComplete,
      hasGuardianPathComplete,
      motherFieldsOptional,
      fatherFieldsOptional,
      guardianFieldsOptional: hasParentPathComplete
    };
  }, [form.family_information.mother_name, form.family_information.father_name, form.family_information.responsible_person]);

  /** Permite agregar el primero con lista vacía; siguientes solo si todas las filas actuales están completas. */
  const canAddWorkingFamilyMember = useMemo(() => {
    const members = form.socioeconomic_information.working_family_members;
    if (members.length === 0) return true;
    return members.every(isWorkingFamilyMemberRowValid);
  }, [form.socioeconomic_information.working_family_members]);

  // Keep stepper carousel in view when current step changes
  useEffect(() => {
    const maxStart = Math.max(0, TOTAL_STEPS - STEPS_VISIBLE);
    if (currentStep < stepperViewStart) {
      setStepperViewStart(Math.max(0, currentStep));
    } else if (currentStep >= stepperViewStart + STEPS_VISIBLE) {
      setStepperViewStart(Math.min(maxStart, currentStep - STEPS_VISIBLE + 1));
    }
  }, [currentStep, stepperViewStart, TOTAL_STEPS, STEPS_VISIBLE]);

  // Reset form when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setForm(getInitialFormState());
      setDocumentFiles({ ...EMPTY_PHASE3_DOCUMENT_FILES });
      setShowParents(true);
      setShowLegalGuardian(false);
      setCurrentStep(0);
      setStepperViewStart(0);
      setDisabilityTypeAddMore('');
      setShowDisabilityTypeAddMore(false);
      setDisabilityTypesError('');
      setInsuranceTypeError('');
      setDisabilityOriginError('');
      setDisabilityCertificateError('');
      setWorkingFamilyMemberErrors([]);
      setBirthDateError('');
      setLocationStepError('');
      setFinalSubmitGaps(null);
      setExtraDocuments([]);
      Object.values(extraFileInputRefs.current).forEach(el => {
        if (el) el.value = '';
      });
      extraFileInputRefs.current = {};
    }
  }, [resetTrigger]);

  const disabilityTypesCount = form.disability_information.disability_type.length;

  useEffect(() => {
    if (disabilityTypesCount >= DISABILITY_TYPE_OPTIONS.length) {
      setShowDisabilityTypeAddMore(false);
      setDisabilityTypeAddMore('');
    }
  }, [disabilityTypesCount]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mobileStepperLastTapRef = useRef(0);
  const uploadFailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onClearSubmitErrorRef = useRef(onClearSubmitError);
  useEffect(() => {
    onClearSubmitErrorRef.current = onClearSubmitError;
  }, [onClearSubmitError]);

  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>(() => ({
    ...EMPTY_PHASE3_DOCUMENT_FILES
  }));
  const [extraDocuments, setExtraDocuments] = useState<ExtraDocumentRow[]>([]);
  const extraFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Estado para documentos genéricos que necesitan asignación manual
  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Format as yyyy-MM-dd for input[type="date"]
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Pre-fill data from existing Phase 3 data when it's a modification
  useEffect(() => {
    if (isModification && currentRecord) {
      setForm(prev => {
        const newForm = { ...prev };

        // Pre-fill complete personal data
        if (currentRecord.complete_personal_data) {
          newForm.complete_personal_data = {
            ...prev.complete_personal_data,
            ...currentRecord.complete_personal_data,
            registration_date: formatDateForInput(currentRecord.complete_personal_data.registration_date) || new Date().toISOString().split('T')[0],
            birth_date: formatDateForInput(currentRecord.complete_personal_data.birth_date) || ''
          };
        }

        // Pre-fill family information
        if (currentRecord.family_information) {
          newForm.family_information = {
            ...prev.family_information,
            ...currentRecord.family_information
          };
        }

        // Pre-fill disability information
        if (currentRecord.disability_information) {
          const mergedDi = {
            ...prev.disability_information,
            ...currentRecord.disability_information
          };
          const normalizedTypes = normalizeDisabilityTypes(mergedDi.disability_type);
          newForm.disability_information = {
            ...mergedDi,
            disability_type:
              normalizedTypes.length > 0 ? normalizedTypes : prev.disability_information.disability_type
          };
        }

        // Pre-fill socioeconomic information
        if (currentRecord.socioeconomic_information) {
          newForm.socioeconomic_information = {
            ...prev.socioeconomic_information,
            ...currentRecord.socioeconomic_information
          };
        }

        // Pre-fill documentation requirements
        if (currentRecord.documentation_requirements) {
          newForm.documentation_requirements = {
            ...prev.documentation_requirements,
            ...currentRecord.documentation_requirements,
            // Ensure affiliation_fee_paid is properly handled
            affiliation_fee_paid: currentRecord.documentation_requirements.affiliation_fee_paid || false
          };
        }

        return newForm;
      });

      const existingBirthPlace = currentRecord.complete_personal_data?.birth_place ?? '';
      setBirthPlaceCharsLeft(Math.max(0, 40 - String(existingBirthPlace).length));

      const existingEmail = currentRecord.complete_personal_data?.email ?? '';
      setEmailCharsLeft(Math.max(0, 50 - String(existingEmail).length));
    }
  }, [isModification, currentRecord, isAdminCreation, isAdminEdit]);

  // Pre-fill data from Phase 1 when component mounts (for new records)
  useEffect(() => {
    if (!isModification && currentRecord?.personal_data) {
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
          canton: phase1Data.canton || '',
          district: phase1Data.district || '',
          exact_address: phase1Data.address || '',
          // Pre-fill phone from Phase 1
          primary_phone: phase1Data.phone || '',
          // Pre-fill email from user account (only for regular users, not admin creation/edit)
          email: (!isAdminCreation && !isAdminEdit) ? (user?.email || '') : '',
          // Pre-fill PCD name if available
          pcd_name: phase1Data.pcd_name || phase1Data.full_name || ''
        },
        family_information: {
          ...prev.family_information,
          mother_name: phase1Data.mother_name || '',
          mother_cedula: phase1Data.mother_cedula || '',
          mother_phone: (phase1Data.mother_phone || '').replace(/\D/g, '').slice(0, 8),
          mother_occupation: phase1Data.mother_occupation || '',
          father_name: phase1Data.father_name || '',
          father_cedula: phase1Data.father_cedula || '',
          father_phone: (phase1Data.father_phone || '').replace(/\D/g, '').slice(0, 8),
          father_occupation: phase1Data.father_occupation || '',
          // Pre-fill legal guardian info if available
          responsible_person: phase1Data.legal_guardian_name || '',
          responsible_cedula: phase1Data.legal_guardian_cedula || '',
          responsible_phone: (phase1Data.legal_guardian_phone || '').replace(/\D/g, '').slice(0, 8),
          responsible_occupation: phase1Data.legal_guardian_occupation || ''
        },
        disability_information: {
          ...prev.disability_information,
          disability_type: (() => {
            const fromPhase1 = normalizeDisabilityTypes(phase1Data.pcd_name);
            return fromPhase1.length > 0 ? fromPhase1 : ([] as DisabilityTypeOption[]);
          })()
        }
      }));

      // Set initial family information mode based on available data
      if (phase1Data.legal_guardian_name) {
        setShowParents(false);
        setShowLegalGuardian(true);
      } else if (phase1Data.mother_name || phase1Data.father_name) {
        setShowParents(true);
        setShowLegalGuardian(false);
      }

      const initialBirthPlace = phase1Data.birth_place || '';
      setBirthPlaceCharsLeft(Math.max(0, 40 - initialBirthPlace.length));

      const initialEmail = (!isAdminCreation && !isAdminEdit) ? (user?.email || '') : '';
      setEmailCharsLeft(Math.max(0, 50 - initialEmail.length));

      const mp = (phase1Data.mother_phone || '').replace(/\D/g, '').slice(0, 8);
      const fp = (phase1Data.father_phone || '').replace(/\D/g, '').slice(0, 8);
      const rp = (phase1Data.legal_guardian_phone || '').replace(/\D/g, '').slice(0, 8);
      setMotherPhoneCharsLeft(Math.max(0, 8 - mp.length));
      setFatherPhoneCharsLeft(Math.max(0, 8 - fp.length));
      setResponsiblePhoneCharsLeft(Math.max(0, 8 - rp.length));
    }
  }, [currentRecord, user, isModification, isAdminCreation, isAdminEdit]);

  // Pre-load cantons and districts when form is pre-filled with Phase 1 data
  useEffect(() => {
    const preloadGeographicData = async () => {
      if (currentRecord?.personal_data && provinces.length > 0) {
        const phase1Data = currentRecord.personal_data;

        // Load cantons if province is pre-filled
        if (phase1Data.province) {
          try {
            const selectedProvince = provinces.find(p => p.name === phase1Data.province);

            if (selectedProvince) {
              setLoadingCantons(true);
              const cantonsData = await getCantonsByProvince(selectedProvince.id);
              setCantons(cantonsData);
              setLoadingCantons(false);

              // Load districts if canton is pre-filled
              if (phase1Data.canton) {
                const selectedCanton = cantonsData.find(c => c.name === phase1Data.canton);

                if (selectedCanton) {
                  setLoadingDistricts(true);
                  const districtsData = await getDistrictsByCanton(selectedCanton.id);
                  setDistricts(districtsData);
                  setLoadingDistricts(false);
                }
              }
            }
          } catch {
            setLoadingCantons(false);
            setLoadingDistricts(false);
          }
        }
      }
    };

    preloadGeographicData();
  }, [currentRecord, provinces]);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const provincesData = await getProvinces();
        setProvinces(provincesData);
      } catch {
        // keep empty provinces list on failure
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  // Load cantons when province changes
  useEffect(() => {
    if (form.complete_personal_data.province) {
      const loadCantons = async () => {
        setLoadingCantons(true);
        try {
          const selectedProvince = provinces.find(p => p.name === form.complete_personal_data.province);
          if (selectedProvince) {
            const cantonsData = await getCantonsByProvince(selectedProvince.id);
            setCantons(cantonsData);
          }
        } catch {
          // keep cantons empty on failure
        } finally {
          setLoadingCantons(false);
        }
      };
      loadCantons();
    } else {
      setCantons([]);
      setDistricts([]);
    }
  }, [form.complete_personal_data.province, provinces]);

  // Load districts when canton changes
  useEffect(() => {
    if (form.complete_personal_data.canton) {
      const loadDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const selectedCanton = cantons.find(c => c.name === form.complete_personal_data.canton);
          if (selectedCanton) {
            const districtsData = await getDistrictsByCanton(selectedCanton.id);
            setDistricts(districtsData);
          }
        } catch {
          // keep districts empty on failure
        } finally {
          setLoadingDistricts(false);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [form.complete_personal_data.canton, cantons]);

  // Document types definition
  const documentTypes = useMemo(() => [
    { key: 'dictamen_medico', label: 'Dictamen Médico', required: true },
    { key: 'constancia_nacimiento', label: 'Constancia de Nacimiento', required: true },
    { key: 'copia_cedula', label: 'Copia de Cédula (solicitante)', required: true },
    { key: 'copias_cedulas_familia', label: 'Copias de Cédulas (familia)', required: true },
    { key: 'foto_pasaporte', label: 'Foto Tamaño Pasaporte', required: true },
    { key: 'constancia_pension_ccss', label: 'Constancia de Pensión CCSS', required: false },
    { key: 'constancia_pension_alimentaria', label: 'Constancia de Pensión Alimentaria', required: false },
    { key: 'constancia_estudio', label: 'Constancia de Estudio (En caso de solicitante este en estudio)', required: false },
    { key: 'cuenta_banco_nacional', label: 'Cuenta Banco Nacional', required: false }
  ], []);

  const applyDocumentRetryReset = useCallback((msg: string) => {
    if (uploadFailTimerRef.current) {
      clearTimeout(uploadFailTimerRef.current);
      uploadFailTimerRef.current = null;
    }
    setDocumentFiles({ ...EMPTY_PHASE3_DOCUMENT_FILES });
    setExtraDocuments([]);
    Object.values(extraFileInputRefs.current).forEach(el => {
      if (el) el.value = '';
    });
    extraFileInputRefs.current = {};
    setForm(prev => ({
      ...prev,
      documentation_requirements: {
        ...prev.documentation_requirements,
        documents: documentTypes.map(doc => ({
          document_type: doc.key as RequiredDocument['document_type'],
          status: 'pendiente' as const,
          observations: ''
        }))
      }
    }));
    Object.values(fileInputRefs.current).forEach(el => {
      if (el) el.value = '';
    });
    setCurrentStep(4);
    setDocumentsStepError(
      `${msg} Vuelva a cargar los documentos y complete este paso antes de enviar de nuevo.`
    );
    onClearSubmitErrorRef.current?.();
  }, [documentTypes]);

  useEffect(() => {
    if (!submitError) return;
    setCurrentStep(LAST_STEP_INDEX);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const msg = submitError;
    uploadFailTimerRef.current = window.setTimeout(() => {
      uploadFailTimerRef.current = null;
      applyDocumentRetryReset(msg);
    }, 4000);
    return () => {
      if (uploadFailTimerRef.current) {
        clearTimeout(uploadFailTimerRef.current);
        uploadFailTimerRef.current = null;
      }
    };
  }, [submitError, applyDocumentRetryReset, LAST_STEP_INDEX]);

  // Initialize document status from saved document_statuses and/or uploaded files
  useEffect(() => {
    const documentStatusMap = new Map<string, string>();

    // 1) Restore statuses saved from dropdown (Entregado, En trámite, No aplica, Pendiente)
    const savedStatuses = currentRecord?.registration_requirements?.document_statuses;
    if (savedStatuses) {
      const list = typeof savedStatuses === 'string' ? JSON.parse(savedStatuses) : savedStatuses;
      if (Array.isArray(list)) {
        list.forEach((item: { document_type?: string; status?: string }) => {
          if (item.document_type && item.status) {
            documentStatusMap.set(item.document_type, item.status);
          }
        });
      }
    }

    // 2) Override with 'entregado' for any document type that has an uploaded file
    if (currentRecord?.documents && currentRecord.documents.length > 0) {
      currentRecord.documents.forEach((doc: { document_type?: string; file_name?: string }) => {
        const formDocumentType = mapBackendDocumentType(doc.document_type || '');
        if (formDocumentType) {
          documentStatusMap.set(formDocumentType, 'entregado');
        }
        if ((doc.document_type as string) === 'payment_info') {
          documentStatusMap.set('informacion_pago', 'entregado');
        }
      });
    }

    const updatedDocuments = documentTypes.map(doc => ({
      document_type: doc.key as RequiredDocument['document_type'],
      status: (documentStatusMap.get(doc.key) as RequiredDocument['status']) || 'pendiente',
      observations: ''
    }));

    const isPaymentPaid = documentStatusMap.get('informacion_pago') === 'entregado';
    // Load affiliation_fee_paid and general_observations from API (registration_requirements);
    // API returns registration_requirements, not documentation_requirements
    const rr = currentRecord?.registration_requirements;
    const affiliationFromApi = rr?.affiliation_fee_paid !== undefined && rr?.affiliation_fee_paid !== null
      ? Boolean(rr.affiliation_fee_paid)
      : undefined;
    const generalObsFromApi = rr?.general_observations != null ? String(rr.general_observations) : undefined;

    setForm(prev => ({
      ...prev,
      documentation_requirements: {
        ...prev.documentation_requirements,
        documents: updatedDocuments,
        affiliation_fee_paid: affiliationFromApi ?? prev.documentation_requirements.affiliation_fee_paid ?? isPaymentPaid,
        general_observations: generalObsFromApi ?? prev.documentation_requirements.general_observations ?? ''
      }
    }));
  }, [currentRecord, documentTypes]);

  // Helper function to map backend document types to form document types
  const mapBackendDocumentType = (backendType: string): string | null => {
    // Direct mapping based on backend document types
    const mapping: { [key: string]: string } = {
      'medical_diagnosis': 'dictamen_medico',
      'birth_certificate': 'constancia_nacimiento',
      'cedula': 'copia_cedula',
      'photo': 'foto_pasaporte',
      'pension_certificate': 'constancia_pension_ccss',
      'study_certificate': 'constancia_estudio',
      'payment_info': 'informacion_pago',
      'copias_cedulas_familia': 'copias_cedulas_familia',
      'pension_alimentaria': 'constancia_pension_alimentaria',
      'cuenta_banco_nacional': 'cuenta_banco_nacional',
      'other': 'cuenta_banco_nacional' // Default for 'other' type
    };

    return mapping[backendType] || null;
  };

  const handleChange = (section: keyof Phase3Data, field: string, value: string | number | boolean | string[] | RequiredDocument[] | AvailableService[]) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateDocumentStatus = (
    documentType: string,
    status: 'pendiente' | 'entregado' | 'en_tramite' | 'no_aplica'
  ) => {
    setForm(prev => ({
      ...prev,
      documentation_requirements: {
        ...prev.documentation_requirements,
        documents: prev.documentation_requirements.documents.map(doc =>
          doc.document_type === documentType ? { ...doc, status } : doc
        )
      }
    }));
  };

  const handleDocumentChange = (documentType: string, file: File | null) => {
    setDocumentFiles(prev => ({
      ...prev,
      [documentType]: file
    }));

    // Actualizar automáticamente el estado del documento cuando se sube un archivo
    if (file) {
      setForm(prev => {
        const existingDoc = prev.documentation_requirements.documents.find(doc => doc.document_type === documentType);

        if (existingDoc) {
          // Update existing document status to 'entregado'
          const updatedDocs = prev.documentation_requirements.documents.map(doc =>
            doc.document_type === documentType ? { ...doc, status: 'entregado' as const } : doc
          );

          const updatedForm = {
            ...prev,
            documentation_requirements: {
              ...prev.documentation_requirements,
              documents: updatedDocs
            }
          };

          // Si es el documento de información de pago, marcar el pago como pagado
          if (documentType === 'informacion_pago') {
            updatedForm.documentation_requirements.affiliation_fee_paid = true;
          }

          return updatedForm;
        } else {
          // Add new document with 'entregado' status
          const newDoc: RequiredDocument = {
            document_type: documentType as RequiredDocument['document_type'],
            status: 'entregado',
            observations: ''
          };
          const updatedDocs = [...prev.documentation_requirements.documents, newDoc];

          const updatedForm = {
            ...prev,
            documentation_requirements: {
              ...prev.documentation_requirements,
              documents: updatedDocs
            }
          };

          // Si es el documento de información de pago, marcar el pago como pagado
          if (documentType === 'informacion_pago') {
            updatedForm.documentation_requirements.affiliation_fee_paid = true;
          }

          return updatedForm;
        }
      });
    } else {
      setForm(prev => {
        const existingDoc = prev.documentation_requirements.documents.find(doc => doc.document_type === documentType);

        if (existingDoc) {
          const updatedDocs = prev.documentation_requirements.documents.map(doc =>
            doc.document_type === documentType ? { ...doc, status: 'pendiente' as const } : doc
          );

          const updatedForm = {
            ...prev,
            documentation_requirements: {
              ...prev.documentation_requirements,
              documents: updatedDocs
            }
          };

          // Si se elimina el documento de información de pago, marcar el pago como pendiente
          if (documentType === 'informacion_pago') {
            updatedForm.documentation_requirements.affiliation_fee_paid = false;
          }

          return updatedForm;
        }
        return prev;
      });
    }
  };

  // Handle working family members dynamically
  const addWorkingFamilyMember = () => {
    setForm((prev) => {
      const prevMembers = prev.socioeconomic_information.working_family_members;
      if (prevMembers.length > 0 && !prevMembers.every(isWorkingFamilyMemberRowValid)) {
        return prev;
      }
      return {
        ...prev,
        socioeconomic_information: {
          ...prev.socioeconomic_information,
          working_family_members: [
            ...prevMembers,
            { name: '', work_type: '', work_place: '', work_phone: '' }
          ]
        }
      };
    });
  };

  const removeWorkingFamilyMember = (index: number) => {
    setForm((prev) => ({
      ...prev,
      socioeconomic_information: {
        ...prev.socioeconomic_information,
        working_family_members: prev.socioeconomic_information.working_family_members.filter((_, i) => i !== index)
      }
    }));
    setWorkingFamilyMemberErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWorkingFamilyMember = (
    index: number,
    field: keyof WorkingFamilyMember,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      socioeconomic_information: {
        ...prev.socioeconomic_information,
        working_family_members: prev.socioeconomic_information.working_family_members.map((member, i) =>
          i === index ? { ...member, [field]: value } : member
        )
      }
    }));
    setWorkingFamilyMemberErrors((prev) => {
      const row = prev[index];
      const key = field as keyof WorkingMemberFieldErrors;
      if (!row?.[key]) return prev;
      const next = [...prev];
      const updated = { ...row };
      delete updated[key];
      next[index] = updated;
      return next;
    });
  };

  // Handle family information display mode toggle
  const handleFamilyModeToggle = (mode: 'parents' | 'guardian') => {
    if (mode === 'parents') {
      setShowParents(true);
      setShowLegalGuardian(false);
      // Don't clear data - preserve it for when user switches back
    } else {
      setShowParents(false);
      setShowLegalGuardian(true);
      // Don't clear data - preserve it for when user switches back
    }
  };

  // --- Per-step validation (return true if step is valid, false otherwise; set error states) ---
  const validateStepPersonal = (): boolean => {
    let ok = true;
    const fullName = form.complete_personal_data.full_name;
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(fullName) || fullName.length < 5 || fullName.length > 40) {
      setFullNameError(fullName.length < 5 && fullName.length > 0 ? 'Mínimo 5 caracteres.' : fullName.length > 40 ? 'Máximo 40 caracteres.' : 'Solo se permiten letras y espacios.');
      ok = false;
    } else setFullNameError('');
    const primaryPhone = form.complete_personal_data.primary_phone;
    if (!/^\d{8}$/.test(primaryPhone)) {
      setPrimaryPhoneError('Formato inválido. Use 88888888.');
      ok = false;
    } else setPrimaryPhoneError('');
    const secondaryPhone = form.complete_personal_data.secondary_phone;
    if (!/^\d{8}$/.test((secondaryPhone || '').trim())) {
      setSecondaryPhoneError('Use 8 dígitos (ej. 88888888). Este campo es obligatorio.');
      ok = false;
    } else setSecondaryPhoneError('');
    const cedula = form.complete_personal_data.cedula;
    if (!/^\d+$/.test(cedula) || cedula.length === 0) {
      setCedulaError(cedula.length === 0 ? 'Este campo es obligatorio.' : 'Solo se permiten números.');
      ok = false;
    } else if (cedula.length < 9 || cedula.length > 13) {
      setCedulaError(cedula.length < 9 ? 'Mínimo 9 dígitos.' : 'Máximo 13 caracteres.');
      ok = false;
    } else setCedulaError('');
    const birthPlace = form.complete_personal_data.birth_place;
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(birthPlace) || birthPlace.length > 40 || birthPlace.length === 0) {
      setBirthPlaceError(birthPlace.length === 0 ? 'Este campo es obligatorio.' : birthPlace.length > 40 ? 'Máximo 40 caracteres.' : 'Solo se permiten letras y espacios.');
      ok = false;
    } else setBirthPlaceError('');

    const bd = form.complete_personal_data.birth_date;
    if (!bd || bd < birthDateLimits.min || bd > birthDateLimits.max) {
      setBirthDateError(
        !bd ? 'Este campo es obligatorio.' : 'La fecha de nacimiento debe estar entre el rango permitido'
      );
      ok = false;
    } else setBirthDateError('');

    if (!form.complete_personal_data.province?.trim() || !form.complete_personal_data.canton?.trim() || !form.complete_personal_data.district?.trim()) {
      setLocationStepError('Seleccione provincia, cantón y distrito.');
      ok = false;
    } else setLocationStepError('');

    const exactAddress = form.complete_personal_data.exact_address;
    if (exactAddress.length === 0) {
      setAddressError('Este campo es obligatorio.');
      ok = false;
    } else if (exactAddress.length > 150) {
      setAddressError('Máximo 150 caracteres.');
      ok = false;
    } else setAddressError('');

    const email = form.complete_personal_data.email;
    if (!email || String(email).trim().length === 0) {
      setEmailError('Este campo es obligatorio.');
      ok = false;
    } else if (String(email).length > 50) {
      setEmailError('Máximo 50 caracteres.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      setEmailError('Debe ingresar un correo electrónico válido.');
      ok = false;
    } else setEmailError('');
    return ok;
  };

  const validateStepFamily = (): boolean => {
    let ok = true;

    const isDisplayNameValid = (s: string) => {
      const t = (s || '').trim();
      return t.length >= 5 && t.length <= 40 && /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(t);
    };

    const mName = (form.family_information.mother_name ?? '').trim();
    const fName = (form.family_information.father_name ?? '').trim();
    const rName = (form.family_information.responsible_person ?? '').trim();

    const motherNameValid = mName.length > 0 && isDisplayNameValid(mName);
    const fatherNameValid = fName.length > 0 && isDisplayNameValid(fName);
    const guardianNameValid = rName.length > 0 && isDisplayNameValid(rName);
    const hasParentPathComplete = motherNameValid || fatherNameValid;
    const hasGuardianPathComplete = guardianNameValid;

    if (!hasParentPathComplete && !hasGuardianPathComplete) {
      setFamilyBlockError('Debe completar al menos la información de un padre o madre, o del encargado legal (nombre con mínimo 5 caracteres).');
      ok = false;
    } else {
      setFamilyBlockError('');
    }

    // Madre
    const mCed = form.family_information.mother_cedula;
    if (mCed && (!/^\d+$/.test(mCed) || mCed.length < 9 || mCed.length > 13)) {
      setMotherCedulaError('La cédula debe tener entre 9 y 13 dígitos numéricos.');
      ok = false;
    } else setMotherCedulaError('');

    if (mName) {
      if (!isDisplayNameValid(mName)) {
        setMotherNameError(mName.length < 5 ? 'Mínimo 5 caracteres.' : mName.length > 40 ? 'Máximo 40 caracteres.' : 'Solo letras y espacios.');
        ok = false;
      } else setMotherNameError('');
    } else setMotherNameError('');

    const mOcc = form.family_information.mother_occupation;
    if (mOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(mOcc) || mOcc.length > 40)) {
      setMotherOccupationError('Máximo 40 caracteres, solo letras.');
      ok = false;
    } else setMotherOccupationError('');

    const mPhoneDigits = (form.family_information.mother_phone || '').replace(/\D/g, '');
    if (mPhoneDigits && !/^\d{8}$/.test(mPhoneDigits)) {
      setMotherPhoneError('Formato inválido. Use 88888888 (8 dígitos).');
      ok = false;
    } else setMotherPhoneError('');

    // Padre
    const fCed = form.family_information.father_cedula;
    if (fCed && (!/^\d+$/.test(fCed) || fCed.length < 9 || fCed.length > 13)) {
      setFatherCedulaError('La cédula debe tener entre 9 y 13 dígitos numéricos.');
      ok = false;
    } else setFatherCedulaError('');

    if (fName) {
      if (!isDisplayNameValid(fName)) {
        setFatherNameError(fName.length < 5 ? 'Mínimo 5 caracteres.' : fName.length > 40 ? 'Máximo 40 caracteres.' : 'Solo letras y espacios.');
        ok = false;
      } else setFatherNameError('');
    } else setFatherNameError('');

    const fOcc = form.family_information.father_occupation;
    if (fOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(fOcc) || fOcc.length > 40)) {
      setFatherOccupationError('Máximo 40 caracteres, solo letras.');
      ok = false;
    } else setFatherOccupationError('');

    const fPhoneDigits = (form.family_information.father_phone || '').replace(/\D/g, '');
    if (fPhoneDigits && !/^\d{8}$/.test(fPhoneDigits)) {
      setFatherPhoneError('Formato inválido. Use 88888888 (8 dígitos).');
      ok = false;
    } else setFatherPhoneError('');

    // Encargado legal
    if (rName) {
      if (!isDisplayNameValid(rName)) {
        setResponsibleNameError(rName.length < 5 ? 'Mínimo 5 caracteres.' : rName.length > 40 ? 'Máximo 40 caracteres.' : 'Solo se permiten letras y espacios.');
        ok = false;
      } else setResponsibleNameError('');
    } else setResponsibleNameError('');

    const rCed = (form.family_information as FamilyInformation & { responsible_cedula?: string }).responsible_cedula;
    if (rCed && (!/^\d+$/.test(rCed) || rCed.length < 9 || rCed.length > 13)) {
      setResponsibleCedulaError('La cédula debe tener entre 9 y 13 dígitos numéricos.');
      ok = false;
    } else setResponsibleCedulaError('');

    const rOcc = form.family_information.responsible_occupation;
    if (rOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(rOcc) || rOcc.length > 40)) {
      setResponsibleOccupationError('Máximo 40 caracteres, solo letras.');
      ok = false;
    } else setResponsibleOccupationError('');

    const rPhoneDigits = (form.family_information.responsible_phone || '').replace(/\D/g, '');
    if (rPhoneDigits && !/^\d{8}$/.test(rPhoneDigits)) {
      setResponsiblePhoneError('Formato inválido. Use 88888888 (8 dígitos).');
      ok = false;
    } else setResponsiblePhoneError('');

    return ok;
  };

  const validateStepDisability = (): boolean => {
    let ok = true;
    const types = form.disability_information.disability_type;
    if (!Array.isArray(types) || types.length === 0) {
      setDisabilityTypesError('Seleccione al menos un tipo de discapacidad.');
      ok = false;
    } else setDisabilityTypesError('');

    const insuranceType = form.disability_information.insurance_type;
    if (
      insuranceType !== 'rnc' &&
      insuranceType !== 'independiente' &&
      insuranceType !== 'privado' &&
      insuranceType !== 'otro'
    ) {
      setInsuranceTypeError('Seleccione el tipo de seguro.');
      ok = false;
    } else setInsuranceTypeError('');

    const origin = form.disability_information.disability_origin;
    if (
      origin !== 'nacimiento' &&
      origin !== 'accidente' &&
      origin !== 'enfermedad'
    ) {
      setDisabilityOriginError('Seleccione el origen de la discapacidad.');
      ok = false;
    } else setDisabilityOriginError('');

    const certificate = form.disability_information.disability_certificate;
    if (certificate !== 'si' && certificate !== 'no' && certificate !== 'en_tramite') {
      setDisabilityCertificateError('Seleccione el estado del certificado de discapacidad.');
      ok = false;
    } else setDisabilityCertificateError('');

    const diseases = form.disability_information.medical_additional.diseases;
    if (diseases && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-[\]{}"'/_]*$/.test(diseases) || diseases.length > 200)) {
      setDiseasesError(diseases.length > 200 ? 'Máximo 200 caracteres.' : 'No se permiten números.');
      ok = false;
    } else setDiseasesError('');
    return ok;
  };

  const validateStepDocuments = (): boolean => {
    // No permitir avanzar si hay documentos requeridos en estado "pendiente"
    const hasPendingRequired = documentTypes.some(doc => {
      if (!doc.required) return false;
      const status = form.documentation_requirements.documents.find(d => d.document_type === doc.key)?.status || 'pendiente';
      return status === 'pendiente';
    });

    if (hasPendingRequired) {
      setDocumentsStepError('Por favor, actualice el estado de todos los documentos requeridos. Ninguno puede quedar en "Pendiente" antes de continuar.');
      return false;
    }

    const incompleteExtra = extraDocuments.some(
      e => (e.title.trim() && !e.file) || (!e.title.trim() && e.file)
    );
    if (incompleteExtra) {
      setDocumentsStepError('En documentos adicionales: cada fila debe tener título y archivo, o elimínela.');
      return false;
    }

    const fileCount =
      Object.values(documentFiles).filter(Boolean).length + extraDocuments.filter(e => e.file).length;
    if (fileCount > MAX_RECORD_UPLOAD_FILES) {
      setDocumentsStepError(`Puede adjuntar como máximo ${MAX_RECORD_UPLOAD_FILES} archivos en total. Reduzca la cantidad.`);
      return false;
    }

    setDocumentsStepError('');
    return true;
  };

  const validateStepSocioeconomic = (): boolean => {
    const members = form.socioeconomic_information.working_family_members;
    const { ok, errors } = validateAllWorkingFamilyMembers(members);
    setWorkingFamilyMemberErrors(ok ? [] : errors);
    return ok;
  };

  const goToNextStep = () => {
    // Admin edit/creation: allow free step navigation without validation (same as desktop step pills)
    if (isAdminEdit || isAdminCreation) {
      setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentStep === 0 && !validateStepPersonal()) return;
    if (currentStep === 1 && !validateStepFamily()) return;
    if (currentStep === 2 && !validateStepDisability()) return;
    if (currentStep === 3 && !validateStepSocioeconomic()) return;
    if (currentStep === 4 && !validateStepDocuments()) return;
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    // Scroll to top when changing steps so the user sees the start of the next section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generalObsStored = form.documentation_requirements.general_observations ?? '';
  const parsedGeneralObservations = useMemo(
    () => parseGeneralObservationsStored(generalObsStored),
    [generalObsStored]
  );
  const generalObservationsRowsForUi = useMemo(
    () => (parsedGeneralObservations.length > 0 ? parsedGeneralObservations : ['']),
    [parsedGeneralObservations]
  );

  const updateGeneralObservationsRow = (idx: number, value: string) => {
    setGeneralObservationsError('');
    if (value.length > MAX_GENERAL_OBSERVATION_NOTE_LENGTH) {
      setGeneralObsRowErrors((prev) => ({
        ...prev,
        [idx]: `Máximo ${MAX_GENERAL_OBSERVATION_NOTE_LENGTH} caracteres.`
      }));
      return;
    }
    if (!GENERAL_OBSERVATIONS_CHAR_PATTERN.test(value)) {
      setGeneralObsRowErrors((prev) => ({
        ...prev,
        [idx]: 'Solo se permiten letras, números y signos de puntuación básicos.'
      }));
      return;
    }
    setGeneralObsRowErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
    const base =
      parsedGeneralObservations.length > 0 ? [...parsedGeneralObservations] : [''];
    base[idx] = value;
    handleChange(
      'documentation_requirements',
      'general_observations',
      serializeGeneralObservationsStored(base)
    );
  };

  const addGeneralObservationsRow = () => {
    setGeneralObservationsError('');
    setGeneralObsRowErrors({});
    const base =
      parsedGeneralObservations.length > 0 ? [...parsedGeneralObservations] : [''];
    if (base.length >= MAX_GENERAL_OBSERVATION_NOTE_COUNT) return;
    base.push('');
    handleChange(
      'documentation_requirements',
      'general_observations',
      serializeGeneralObservationsStored(base)
    );
  };

  const removeGeneralObservationsRow = (idx: number) => {
    setGeneralObservationsError('');
    setGeneralObsRowErrors({});
    const base =
      parsedGeneralObservations.length > 0 ? [...parsedGeneralObservations] : [''];
    if (base.length === 1) {
      handleChange('documentation_requirements', 'general_observations', '');
      return;
    }
    base.splice(idx, 1);
    handleChange(
      'documentation_requirements',
      'general_observations',
      serializeGeneralObservationsStored(base)
    );
  };

  /** Full checklist for final submit: which step and what is missing or invalid. */
  const getFinalSubmitStepIssues = (): FinalSubmitGap[] => {
    const gaps: FinalSubmitGap[] = [];
    const cpd = form.complete_personal_data;

    const personalItems: string[] = [];
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(cpd.full_name) || cpd.full_name.length < 5 || cpd.full_name.length > 40) {
      personalItems.push('Nombre completo: solo letras y espacios, entre 5 y 40 caracteres.');
    }
    if (!/^\d{8}$/.test(cpd.primary_phone)) {
      personalItems.push('Teléfono principal: use exactamente 8 dígitos (ej. 88888888).');
    }
    if (!/^\d{8}$/.test((cpd.secondary_phone || '').trim())) {
      personalItems.push('Teléfono secundario: 8 dígitos obligatorios.');
    }
    if (!/^\d+$/.test(cpd.cedula) || cpd.cedula.length === 0) {
      personalItems.push('Cédula: obligatoria y solo números.');
    } else if (cpd.cedula.length < 9 || cpd.cedula.length > 13) {
      personalItems.push('Cédula: entre 9 y 13 dígitos.');
    }
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(cpd.birth_place) || cpd.birth_place.length > 40 || cpd.birth_place.length === 0) {
      personalItems.push('Lugar de nacimiento: obligatorio, letras y espacios, máximo 40 caracteres.');
    }
    const bd = cpd.birth_date;
    if (!bd || bd < birthDateLimits.min || bd > birthDateLimits.max) {
      personalItems.push('Fecha de nacimiento: obligatoria y dentro del rango permitido.');
    }
    if (!cpd.province?.trim() || !cpd.canton?.trim() || !cpd.district?.trim()) {
      personalItems.push('Ubicación: seleccione provincia, cantón y distrito.');
    }
    const addr = cpd.exact_address ?? '';
    if (addr.length === 0) {
      personalItems.push('Dirección exacta del domicilio: obligatoria.');
    } else if (addr.length > 150) {
      personalItems.push('Dirección exacta: máximo 150 caracteres.');
    }
    const em = cpd.email;
    if (!em || String(em).trim().length === 0) {
      personalItems.push('Correo electrónico: obligatorio.');
    } else if (String(em).length > 50) {
      personalItems.push('Correo electrónico: máximo 50 caracteres.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(em))) {
      personalItems.push('Correo electrónico: formato no válido.');
    }
    if (personalItems.length > 0) {
      gaps.push({ stepIndex: 0, stepLabel: STEP_LABELS[0], items: personalItems });
    }

    const isDisplayNameValid = (s: string) => {
      const t = (s || '').trim();
      return t.length >= 5 && t.length <= 40 && /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(t);
    };
    const mName = (form.family_information.mother_name ?? '').trim();
    const fName = (form.family_information.father_name ?? '').trim();
    const rName = (form.family_information.responsible_person ?? '').trim();
    const motherNameValid = mName.length > 0 && isDisplayNameValid(mName);
    const fatherNameValid = fName.length > 0 && isDisplayNameValid(fName);
    const guardianNameValid = rName.length > 0 && isDisplayNameValid(rName);
    const hasParentPathComplete = motherNameValid || fatherNameValid;
    const hasGuardianPathComplete = guardianNameValid;

    const familyItems: string[] = [];
    if (!hasParentPathComplete && !hasGuardianPathComplete) {
      familyItems.push('Indique al menos un padre o madre con nombre válido, o un encargado legal con nombre válido (mínimo 5 caracteres, solo letras).');
    }
    const mCed = form.family_information.mother_cedula;
    if (mCed && (!/^\d+$/.test(mCed) || mCed.length < 9 || mCed.length > 13)) {
      familyItems.push('Madre — Cédula: entre 9 y 13 dígitos numéricos.');
    }
    if (mName && !isDisplayNameValid(mName)) {
      familyItems.push('Madre — Nombre: entre 5 y 40 caracteres, solo letras y espacios.');
    }
    const mOcc = form.family_information.mother_occupation;
    if (mOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(mOcc) || mOcc.length > 40)) {
      familyItems.push('Madre — Ocupación: máximo 40 caracteres, solo letras.');
    }
    const mPhoneDigits = (form.family_information.mother_phone || '').replace(/\D/g, '');
    if (mPhoneDigits && !/^\d{8}$/.test(mPhoneDigits)) {
      familyItems.push('Madre — Teléfono: 8 dígitos.');
    }
    const fCed = form.family_information.father_cedula;
    if (fCed && (!/^\d+$/.test(fCed) || fCed.length < 9 || fCed.length > 13)) {
      familyItems.push('Padre — Cédula: entre 9 y 13 dígitos numéricos.');
    }
    if (fName && !isDisplayNameValid(fName)) {
      familyItems.push('Padre — Nombre: entre 5 y 40 caracteres, solo letras y espacios.');
    }
    const fOcc = form.family_information.father_occupation;
    if (fOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(fOcc) || fOcc.length > 40)) {
      familyItems.push('Padre — Ocupación: máximo 40 caracteres, solo letras.');
    }
    const fPhoneDigits = (form.family_information.father_phone || '').replace(/\D/g, '');
    if (fPhoneDigits && !/^\d{8}$/.test(fPhoneDigits)) {
      familyItems.push('Padre — Teléfono: 8 dígitos.');
    }
    if (rName && !isDisplayNameValid(rName)) {
      familyItems.push('Encargado legal — Nombre: entre 5 y 40 caracteres, solo letras y espacios.');
    }
    const rCed = (form.family_information as FamilyInformation & { responsible_cedula?: string }).responsible_cedula;
    if (rCed && (!/^\d+$/.test(rCed) || rCed.length < 9 || rCed.length > 13)) {
      familyItems.push('Encargado legal — Cédula: entre 9 y 13 dígitos numéricos.');
    }
    const rOcc = form.family_information.responsible_occupation;
    if (rOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(rOcc) || rOcc.length > 40)) {
      familyItems.push('Encargado legal — Ocupación: máximo 40 caracteres, solo letras.');
    }
    const rPhoneDigits = (form.family_information.responsible_phone || '').replace(/\D/g, '');
    if (rPhoneDigits && !/^\d{8}$/.test(rPhoneDigits)) {
      familyItems.push('Encargado legal — Teléfono: 8 dígitos.');
    }
    if (familyItems.length > 0) {
      gaps.push({ stepIndex: 1, stepLabel: STEP_LABELS[1], items: familyItems });
    }

    const disabilityItems: string[] = [];
    const types = form.disability_information.disability_type;
    if (!Array.isArray(types) || types.length === 0) {
      disabilityItems.push('Tipo(s) de discapacidad: seleccione al menos uno.');
    }
    const insuranceType = form.disability_information.insurance_type;
    if (
      insuranceType !== 'rnc' &&
      insuranceType !== 'independiente' &&
      insuranceType !== 'privado' &&
      insuranceType !== 'otro'
    ) {
      disabilityItems.push('Tipo de seguro: seleccione una opción.');
    }
    const origin = form.disability_information.disability_origin;
    if (
      origin !== 'nacimiento' &&
      origin !== 'accidente' &&
      origin !== 'enfermedad'
    ) {
      disabilityItems.push('Origen de la discapacidad: seleccione una opción.');
    }
    const certificate = form.disability_information.disability_certificate;
    if (certificate !== 'si' && certificate !== 'no' && certificate !== 'en_tramite') {
      disabilityItems.push('Certificado de discapacidad: indique si / no / en trámite.');
    }
    const diseases = form.disability_information.medical_additional.diseases;
    if (diseases && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-[\]{}"'/_]*$/.test(diseases) || diseases.length > 200)) {
      disabilityItems.push(
        diseases.length > 200 ? 'Enfermedades que padece: máximo 200 caracteres.' : 'Enfermedades que padece: no se permiten números en el texto.'
      );
    }
    if (disabilityItems.length > 0) {
      gaps.push({ stepIndex: 2, stepLabel: STEP_LABELS[2], items: disabilityItems });
    }

    const wmMembers = form.socioeconomic_information.working_family_members;
    const wmErrors = wmMembers.map(validateWorkingFamilyMemberRow);
    const wmItems = formatWorkingFamilyRowIssues(wmErrors);
    if (wmItems.length > 0) {
      gaps.push({ stepIndex: 3, stepLabel: STEP_LABELS[3], items: wmItems });
    }

    const docItems: string[] = [];
    documentTypes.forEach(doc => {
      if (!doc.required) return;
      const status =
        form.documentation_requirements.documents.find(d => d.document_type === doc.key)?.status || 'pendiente';
      if (status === 'pendiente') {
        docItems.push(`${doc.label}: el estado no puede ser «Pendiente». Indique entregado, en trámite o no aplica.`);
      }
    });
    extraDocuments.forEach((e, i) => {
      if (e.title.trim() && !e.file) {
        docItems.push(`Documento adicional ${i + 1}: falta el archivo o elimine la fila.`);
      }
      if (!e.title.trim() && e.file) {
        docItems.push(`Documento adicional ${i + 1}: indique un título o quite el archivo.`);
      }
    });
    const totalFiles =
      Object.values(documentFiles).filter(Boolean).length + extraDocuments.filter(x => x.file).length;
    if (totalFiles > MAX_RECORD_UPLOAD_FILES) {
      docItems.push(`Adjuntos: máximo ${MAX_RECORD_UPLOAD_FILES} archivos en total (incluye documentos adicionales).`);
    }
    if (docItems.length > 0) {
      gaps.push({ stepIndex: 4, stepLabel: STEP_LABELS[4], items: docItems });
    }

    const reqItems: string[] = [];
    const obsRows = parseGeneralObservationsStored(form.documentation_requirements.general_observations);
    obsRows.forEach((note, i) => {
      if (!note.trim()) return;
      if (note.length > MAX_GENERAL_OBSERVATION_NOTE_LENGTH) {
        reqItems.push(
          `Observaciones generales (nota ${i + 1}): máximo ${MAX_GENERAL_OBSERVATION_NOTE_LENGTH} caracteres.`
        );
      } else if (!GENERAL_OBSERVATIONS_CHAR_PATTERN.test(note)) {
        reqItems.push(`Observaciones generales (nota ${i + 1}): caracteres no permitidos.`);
      }
    });
    const nonEmptyObs = obsRows.filter((n) => n.trim().length > 0).length;
    if (nonEmptyObs > MAX_GENERAL_OBSERVATION_NOTE_COUNT) {
      reqItems.push(`Observaciones generales: máximo ${MAX_GENERAL_OBSERVATION_NOTE_COUNT} notas.`);
    }
    if (reqItems.length > 0) {
      gaps.push({ stepIndex: LAST_STEP_INDEX, stepLabel: STEP_LABELS[LAST_STEP_INDEX], items: reqItems });
    }

    return gaps;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== LAST_STEP_INDEX) {
      goToNextStep();
      return;
    }

    const stepIssues = getFinalSubmitStepIssues();
    if (stepIssues.length > 0) {
      setFinalSubmitGaps(stepIssues);
      validateStepPersonal();
      validateStepFamily();
      validateStepDisability();
      validateStepSocioeconomic();
      validateStepDocuments();
      const diseasesChk = form.disability_information.medical_additional.diseases;
      if (diseasesChk && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-[\]{}"'/_]*$/.test(diseasesChk) || diseasesChk.length > 200)) {
        setDiseasesError(
          diseasesChk.length > 200 ? 'Máximo 200 caracteres.' : 'No se permiten números.'
        );
      }
      const genObsRows = parseGeneralObservationsStored(form.documentation_requirements.general_observations);
      let genObsErr = '';
      for (let i = 0; i < genObsRows.length && !genObsErr; i++) {
        const note = genObsRows[i];
        if (!note.trim()) continue;
        if (note.length > MAX_GENERAL_OBSERVATION_NOTE_LENGTH) {
          genObsErr = `Observación ${i + 1}: máximo ${MAX_GENERAL_OBSERVATION_NOTE_LENGTH} caracteres.`;
        } else if (!GENERAL_OBSERVATIONS_CHAR_PATTERN.test(note)) {
          genObsErr = `Observación ${i + 1}: solo se permiten letras, números y signos de puntuación básicos.`;
        }
      }
      if (genObsRows.filter((n) => n.trim().length > 0).length > MAX_GENERAL_OBSERVATION_NOTE_COUNT) {
        genObsErr = `Máximo ${MAX_GENERAL_OBSERVATION_NOTE_COUNT} notas.`;
      }
      if (genObsErr) setGeneralObservationsError(genObsErr);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFinalSubmitGaps(null);

    // Convertir archivos específicos a array con sus tipos
    const specificDocuments = Object.entries(documentFiles)
      .filter(([, file]) => file !== null)
      .map(([type, file]) => ({
        type,
        file: file as File
      }));

    const extraSubmitParts = extraDocuments
      .filter(e => e.file && e.title.trim())
      .map(e => {
        const file = buildUniqueExtraFile(e.id, e.title, e.file as File);
        return { type: 'otros' as const, file };
      });

    const allDocuments = [...specificDocuments, ...extraSubmitParts];

    const formData: Phase3Data = {
      ...form,
      documents: allDocuments.map(doc => doc.file) // Keep the original format for now
    };

    formData.documentTypes = allDocuments.reduce<Record<string, string>>((acc, doc) => {
      acc[doc.file.name] = doc.type;
      return acc;
    }, {});

    onSubmit(formData);
  };

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden box-border bg-white rounded-lg shadow-sm p-4 sm:p-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      {/* Header Hide for now
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
            {isAdminEdit ? 'Edición Administrativa de Expediente' :
              isAdminCreation ? 'Crear Expediente Directo' :
                isModification ? 'Actualización de Expediente - Fase 3' :
                  'Formulario Completo - Fase 3'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-0.5">
            {isAdminEdit
              ? 'Edite cualquier campo del expediente con capacidad de override administrativo'
              : isAdminCreation
                ? 'Complete toda la información para crear un expediente directamente como administrador'
                : isModification
                  ? 'Actualice la información según las modificaciones solicitadas por el administrador'
                  : 'Complete toda la información requerida para su expediente'
            }
          </p>
        </div>
      </div>
      */}

      {finalSubmitGaps && finalSubmitGaps.length > 0 && (
        <div
          className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-semibold text-amber-900 mb-2">
            Revise la información faltante o con error en los pasos indicados:
          </p>
          <div className="space-y-4">
            {finalSubmitGaps.map((gap) => (
              <div key={gap.stepIndex}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-amber-950">
                    Paso {gap.stepIndex + 1} — {gap.stepLabel}
                  </span>
                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-700 underline hover:text-blue-900"
                    onClick={() => {
                      setFinalSubmitGaps(null);
                      setCurrentStep(gap.stepIndex);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Ir a este paso
                  </button>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-amber-900">
                  {gap.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 text-xs font-medium text-amber-900 underline hover:text-amber-950"
            onClick={() => setFinalSubmitGaps(null)}
          >
            Cerrar resumen
          </button>
        </div>
      )}

      {/* Step progress */}
      <div className="mb-6 sm:mb-8 min-w-0">
        {/* Mobile: prev/next only (label hidden to avoid overflow); debounce to avoid double-tap skip */}
        <div className="sm:hidden flex items-center justify-between gap-2 min-w-0 w-full">
          <button
            type="button"
            onClick={() => {
              const now = Date.now();
              if (now - mobileStepperLastTapRef.current < 400) return;
              mobileStepperLastTapRef.current = now;
              setCurrentStep(s => Math.max(0, s - 1));
            }}
            disabled={currentStep === 0}
            className="flex-shrink-0 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
            aria-label="Paso anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-900 truncate text-center block w-full">
              {currentStep + 1}/{TOTAL_STEPS} · {STEP_LABELS[currentStep]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const now = Date.now();
              if (now - mobileStepperLastTapRef.current < 400) return;
              mobileStepperLastTapRef.current = now;
              setCurrentStep(s => Math.min(TOTAL_STEPS - 1, s + 1));
            }}
            disabled={currentStep >= TOTAL_STEPS - 1}
            className="flex-shrink-0 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
            aria-label="Siguiente paso"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop: carousel with 3 steps visible */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
              aria-label="Paso anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-1 items-center justify-center gap-1 min-w-0">
              {Array.from({ length: STEPS_VISIBLE }, (_, i) => {
                const index = stepperViewStart + i;
                if (index >= TOTAL_STEPS) return null;
                const label = STEP_LABELS[index];
                const isCurrent = index === currentStep;
                const canGoToStep = (isAdminEdit || isAdminCreation) ? true : index <= currentStep;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => canGoToStep && setCurrentStep(index)}
                    className={`flex flex-col items-center flex-1 min-w-0 max-w-[100px] min-h-[44px] py-2 px-1 rounded-lg transition-colors touch-manipulation ${
                      isCurrent
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-2'
                        : canGoToStep
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 cursor-pointer'
                          : 'text-gray-400 cursor-default'
                    }`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold flex-shrink-0 ${
                      isCurrent ? 'bg-blue-600 text-white' : canGoToStep ? 'bg-gray-300 text-gray-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-xs mt-1 truncate w-full text-center">{label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToNextStep();
              }}
              disabled={currentStep >= TOTAL_STEPS - 1}
              className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
              aria-label="Siguiente paso"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Paso {currentStep + 1} de {TOTAL_STEPS}: {STEP_LABELS[currentStep]}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="min-w-0 w-full max-w-full overflow-x-hidden box-border break-words space-y-6 sm:space-y-8 [&_input]:text-base [&_select]:text-base [&_textarea]:text-base">
        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Subiendo documentos...</span>
              <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        {currentStep === 0 && (
        <>
        {/* Datos Personales Completos */}
        <div className={`border rounded-lg p-4 sm:p-6 ${needsModification('complete_personal_data')
          ? 'border-orange-300 bg-orange-50'
          : 'border-gray-200'
          }`}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900">Datos Personales Completos</h3>
            {needsModification('complete_personal_data') && (
              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Requiere Modificación
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inscripción *
              </label>
              <input
                type="date"
                value={form.complete_personal_data.registration_date}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Esta fecha no puede ser modificada</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo 
              </label>
              <input
                type="text"
                value={form.complete_personal_data.full_name}
                onChange={(e) => {
                  const value = e.target.value;
                  const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                  const length = value.length;

                  // Si contiene caracteres inválidos, no actualizamos y mostramos error
                  if (!isValid) {
                    setFullNameError('Solo se permiten letras y espacios.');
                    return;
                  }

                  // Si excede el máximo, no actualizamos y mostramos error
                  if (length > 40) {
                    setFullNameError('Máximo 40 caracteres.');
                    return;
                  }

                  // Validación de mínimo (solo si ya escribió algo)
                  if (length > 0 && length < 5) {
                    setFullNameError('Mínimo 5 caracteres.');
                  } else {
                    setFullNameError('');
                  }

                  // Actualizamos solo si es válido
                  handleChange('complete_personal_data', 'full_name', value);
                  setFullNameCharsLeft(40 - length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fullNameError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
                placeholder="Ej: Nombre, Apellido, Apellido2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {fullNameCharsLeft} caracteres restantes (mínimo 5, máximo 40)
              </p>
              {fullNameError && <p className="text-xs text-red-500 mt-1">{fullNameError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cédula 
              </label>
              <input
                type="text"
                value={form.complete_personal_data.cedula}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const isValid = /^\d*$/.test(rawValue); // Solo dígitos o vacío
                  const isLengthValid = rawValue.length <= 13;

                  if (!isValid) {
                    setCedulaError('Solo se permiten números.');
                    // No actualizamos el formulario
                    return;
                  }

                  if (!isLengthValid) {
                    setCedulaError('Máximo 13 caracteres.');
                    return;
                  }

                  // Si todo es válido, limpiamos el error y actualizamos
                  setCedulaError('');
                  handleChange('complete_personal_data', 'cedula', rawValue);
                  setCedulaCharsLeft(13 - rawValue.length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${cedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
                placeholder="Nacional u Dimex."
              />
              {form.complete_personal_data.cedula.length < 9 && (
                <p className="text-xs text-gray-500 mt-1">
                  {cedulaCharsLeft} caracteres restantes (entre 9 y 13 dígitos)
                </p>
              )}
              {cedulaError && <p className="text-xs text-red-500 mt-1">{cedulaError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo 
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
                Fecha de Nacimiento 
              </label>
              <input
                type="date"
                value={form.complete_personal_data.birth_date}
                onChange={(e) => {
                  const v = e.target.value;
                  handleChange('complete_personal_data', 'birth_date', v);

                  if (v && (v < birthDateLimits.min || v > birthDateLimits.max)) {
                    setBirthDateError('La fecha de nacimiento debe estar entre el rango permitido');
                    e.target.setCustomValidity('Fecha de nacimiento inválida.');
                    return;
                  }

                  setBirthDateError('');
                  e.target.setCustomValidity('');
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${birthDateError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                min={birthDateLimits.min}
                max={birthDateLimits.max}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Debe ser una fecha válida (entre {birthDateLimits.min} y {birthDateLimits.max})
              </p>
              {birthDateError && <p className="text-xs text-red-500 mt-1">{birthDateError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lugar de Nacimiento 
              </label>
              <input
                type="text"
                value={form.complete_personal_data.birth_place}
                onChange={(e) => {
                  const value = e.target.value;
                  const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                  const length = value.length;

                  if (!isValid) {
                    setBirthPlaceError('Solo se permiten letras y espacios.');
                    return;
                  }

                  if (length > 40) {
                    setBirthPlaceError('Máximo 40 caracteres.');
                    return;
                  }

                  setBirthPlaceError('');
                  handleChange('complete_personal_data', 'birth_place', value);
                  setBirthPlaceCharsLeft(40 - length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${birthPlaceError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
                placeholder="Ej: Nicoya, Guanacaste"
              />
              <p className="text-xs text-gray-500 mt-1">
                {birthPlaceCharsLeft} caracteres restantes (máximo 40)
              </p>
              {birthPlaceError && <p className="text-xs text-red-500 mt-1">{birthPlaceError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Principal 
              </label>
              <input
                type="text"
                value={form.complete_personal_data.primary_phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                  const formatted = digits;
                  if (formatted.length > 8) return;

                  setPrimaryPhoneError('');
                  handleChange('complete_personal_data', 'primary_phone', formatted);
                  setPrimaryPhoneCharsLeft(8 - formatted.length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${primaryPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
                placeholder="Ej: 88888888"
              />
              <p className="text-xs text-gray-500 mt-1">
                {primaryPhoneCharsLeft} caracteres restantes (máximo 8, formato: 88888888)
              </p>
              {primaryPhoneError && <p className="text-xs text-red-500 mt-1">{primaryPhoneError}</p>}
            </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Secundario 
              </label>
              <input
                type="text"
                value={form.complete_personal_data.secondary_phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                  const formatted = digits;
                  if (formatted.length > 8) return;

                  setSecondaryPhoneError('');
                  handleChange('complete_personal_data', 'secondary_phone', formatted);
                  setSecondaryPhoneCharsLeft(8 - formatted.length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${secondaryPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
                placeholder="Ej: 88888888"
              />
              <p className="text-xs text-gray-500 mt-1">
                {secondaryPhoneCharsLeft} caracteres restantes (máximo 8, formato: 88888888)
              </p>
              {secondaryPhoneError && <p className="text-xs text-red-500 mt-1">{secondaryPhoneError}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico 
              </label>
              <input
                type="email"
                value={form.complete_personal_data.email}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 50);
                  setForm(prev => ({
                    ...prev,
                    complete_personal_data: {
                      ...prev.complete_personal_data,
                      email: v
                    }
                  }));
                  setEmailCharsLeft(Math.max(0, 50 - v.length));
                  if (!v.trim()) setEmailError('Este campo es obligatorio.');
                  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setEmailError('Debe ingresar un correo electrónico válido.');
                  else setEmailError('');
                }}
                readOnly={!isAdminCreation && !isAdminEdit}
                required
                maxLength={50}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${!isAdminCreation && !isAdminEdit
                  ? 'bg-gray-50 cursor-not-allowed'
                  : 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder={isAdminCreation || isAdminEdit ? "correo electrónico" : "Obtenido de su cuenta"}
              />
              <p className="text-xs text-gray-500 mt-1">
                {isAdminCreation || isAdminEdit
                  ? ""
                  : "Obtenido automáticamente de su cuenta"
                }
              </p>
              <p className="text-xs text-gray-500 mt-1 text-left">
                {emailCharsLeft} caracteres restantes (máximo 50)
              </p>
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de domicilio exacta 
            </label>
            <textarea
              value={form.complete_personal_data.exact_address ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const length = value.length;

                if (length > 150) {
                  setAddressError('Máximo 150 caracteres.');
                  return;
                }

                setAddressError('');
                handleChange('complete_personal_data', 'exact_address', value);
                setAddressCharsLeft(150 - length);
              }}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${addressError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              required
              placeholder="Direccion exacta"
            />
            <p className="text-xs text-gray-500 mt-1">
              {addressCharsLeft} caracteres restantes (máximo 150)
            </p>
            {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-4 min-w-0">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia 
              </label>
              <select
                value={form.complete_personal_data.province}
                onChange={(e) => {
                  const newProvince = e.target.value;
                  handleChange('complete_personal_data', 'province', newProvince);
                  // Clear canton and district when province changes (unless it's the same province)
                  if (newProvince !== form.complete_personal_data.province) {
                    handleChange('complete_personal_data', 'canton', '');
                    handleChange('complete_personal_data', 'district', '');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingProvinces}
              >
                <option value="">{loadingProvinces ? 'Cargando...' : 'Seleccione una provincia'}</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantón 
              </label>
              <select
                value={form.complete_personal_data.canton || ''}
                onChange={(e) => {
                  const newCanton = e.target.value;
                  handleChange('complete_personal_data', 'canton', newCanton);
                  // Clear district when canton changes (unless it's the same canton)
                  if (newCanton !== form.complete_personal_data.canton) {
                    handleChange('complete_personal_data', 'district', '');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!form.complete_personal_data.province || loadingCantons}
              >
                <option value="">{loadingCantons ? 'Cargando cantones...' : 'Seleccione un cantón'}</option>
                {cantons.map((canton) => (
                  <option key={canton.id} value={canton.name}>
                    {canton.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distrito 
              </label>
              <select
                value={form.complete_personal_data.district || ''}
                onChange={(e) => handleChange('complete_personal_data', 'district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!form.complete_personal_data.canton || loadingDistricts}
              >
                <option value="">{loadingDistricts ? 'Cargando distritos...' : 'Seleccione un distrito'}</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {locationStepError && (
            <p className="mt-2 text-sm text-red-600">{locationStepError}</p>
          )}
        </div>
        </>
        )}

        {currentStep === 1 && (
        <>
        {/* Información Familiar */}
        <div className={`border rounded-lg p-4 sm:p-6 ${needsModification('family_information')
          ? 'border-orange-300 bg-orange-50'
          : 'border-gray-200'
          }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 min-w-0">
                Información Familiar — requiere un padre/madre o encargado legal
              </h3>
              {needsModification('family_information') && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full flex-shrink-0">
                  Requiere Modificación
                </span>
              )}
            </div>

            {/* Toggle between Parents and Legal Guardian (mobile: full width, larger touch targets) */}
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto min-w-0">
              <button
                type="button"
                onClick={() => handleFamilyModeToggle('parents')}
                className={`flex-1 min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-colors touch-manipulation ${showParents
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 active:text-gray-900'
                  }`}
              >
                Información de Padres
              </button>
              <button
                type="button"
                onClick={() => handleFamilyModeToggle('guardian')}
                className={`flex-1 min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-colors touch-manipulation ${showLegalGuardian
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 active:text-gray-900'
                  }`}
              >
                Encargado Legal
              </button>
            </div>
          </div>

          {familyBlockError && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
              {familyBlockError}
            </div>
          )}

          {/* Información de la Madre - Only show when parents mode is selected */}
          {showParents && (
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-md font-medium text-gray-800">Información de la Madre</h4>
                <button
                  type="button"
                  onClick={() => setMotherSectionOpen((v) => !v)}
                  className="shrink-0 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px]"
                  aria-expanded={motherSectionOpen}
                  aria-controls="phase3-mother-fields"
                  aria-label={motherSectionOpen ? 'Ocultar datos de la madre' : 'Mostrar datos de la madre'}
                  title={motherSectionOpen ? 'Ocultar' : 'Mostrar'}
                >
                  {motherSectionOpen ? (
                    <EyeOff className="w-5 h-5" aria-hidden />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              {motherSectionOpen && (
              <div id="phase3-mother-fields" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Madre {familyPathCompletion.motherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.mother_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                      const length = value.length;

                      if (!isValid) {
                        setMotherNameError('Solo se permiten letras y espacios.');
                        return;
                      }

                      if (length > 40) {
                        setMotherNameError('Máximo 40 caracteres.');
                        return;
                      }

                      setMotherNameError('');
                      handleChange('family_information', 'mother_name', value);
                      setMotherNameCharsLeft(40 - length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherNameError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder={familyPathCompletion.motherFieldsOptional ? 'Opcional' : 'Mín. 5 caracteres'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {motherNameCharsLeft} caracteres restantes (mín. 5, máx. 40)
                  </p>
                  {motherNameError && <p className="text-xs text-red-500 mt-1">{motherNameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cédula Madre {familyPathCompletion.motherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.mother_cedula}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const isValid = /^\d*$/.test(rawValue);
                      const isLengthValid = rawValue.length <= 13;

                      if (!isValid) {
                        setMotherCedulaError('Solo se permiten números.');
                        return;
                      }

                      if (!isLengthValid) {
                        setMotherCedulaError('Máximo 13 caracteres.');
                        return;
                      }

                      setMotherCedulaError('');
                      handleChange('family_information', 'mother_cedula', rawValue);
                      setMotherCedulaCharsLeft(13 - rawValue.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="Nacional u Dimex."
                  />
                  {form.family_information.mother_cedula.length < 9 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {motherCedulaCharsLeft} caracteres restantes (entre 9 y 13 dígitos)
                    </p>
                  )}
                {motherCedulaError && <p className="text-xs text-red-500 mt-1">{motherCedulaError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupación de la Madre {familyPathCompletion.motherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.mother_occupation}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                      const length = value.length;

                      if (!isValid) {
                        setMotherOccupationError('Solo se permiten letras y espacios.');
                        return;
                      }

                      if (length > 40) {
                        setMotherOccupationError('Máximo 40 caracteres.');
                        return;
                      }

                      setMotherOccupationError('');
                      handleChange('family_information', 'mother_occupation', value);
                      setMotherOccupationCharsLeft(40 - length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherOccupationError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder='Mín. 5 caracteres'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {motherOccupationCharsLeft} caracteres restantes (mín. 5, máx. 40)
                  </p>
                  {motherOccupationError && <p className="text-xs text-red-500 mt-1">{motherOccupationError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de la Madre {familyPathCompletion.motherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.mother_phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setMotherPhoneError('');
                      handleChange('family_information', 'mother_phone', digits);
                      setMotherPhoneCharsLeft(8 - digits.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="Ej: 88888888"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {motherPhoneCharsLeft} caracteres restantes (máximo 8, formato: 88888888)
                  </p>
                  {motherPhoneError && <p className="text-xs text-red-500 mt-1">{motherPhoneError}</p>}
                </div>
              </div>
              )}
            </div>
          )}


          {/* Información del Padre - Only show when parents mode is selected */}
          {showParents && (
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-md font-medium text-gray-800">Información del Padre</h4>
                <button
                  type="button"
                  onClick={() => setFatherSectionOpen((v) => !v)}
                  className="shrink-0 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px]"
                  aria-expanded={fatherSectionOpen}
                  aria-controls="phase3-father-fields"
                  aria-label={fatherSectionOpen ? 'Ocultar datos del padre' : 'Mostrar datos del padre'}
                  title={fatherSectionOpen ? 'Ocultar' : 'Mostrar'}
                >
                  {fatherSectionOpen ? (
                    <EyeOff className="w-5 h-5" aria-hidden />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              {fatherSectionOpen && (
              <div id="phase3-father-fields" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Padre {familyPathCompletion.fatherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.father_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                      const length = value.length;

                      if (!isValid) {
                        setFatherNameError('Solo se permiten letras y espacios.');
                        return;
                      }

                      if (length > 40) {
                        setFatherNameError('Máximo 40 caracteres.');
                        return;
                      }

                      setFatherNameError('');
                      handleChange('family_information', 'father_name', value);
                      setFatherNameCharsLeft(40 - length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherNameError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder={familyPathCompletion.fatherFieldsOptional ? 'Opcional' : 'Mín. 5 caracteres'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fatherNameCharsLeft} caracteres restantes (mín. 5, máx. 40)
                  </p>
                  {fatherNameError && <p className="text-xs text-red-500 mt-1">{fatherNameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cédula Padre {familyPathCompletion.fatherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.father_cedula}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const isValid = /^\d*$/.test(rawValue);
                      const isLengthValid = rawValue.length <= 13;

                      if (!isValid) {
                        setFatherCedulaError('Solo se permiten números.');
                        return;
                      }

                      if (!isLengthValid) {
                        setFatherCedulaError('Máximo 13 caracteres.');
                        return;
                      }

                      setFatherCedulaError('');
                      handleChange('family_information', 'father_cedula', rawValue);
                      setFatherCedulaCharsLeft(13 - rawValue.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="Nacional u Dimex."
                  />
                  {form.family_information.father_cedula.length < 9 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {fatherCedulaCharsLeft} caracteres restantes (entre 9 y 13 dígitos)
                    </p>
                  )}
                {fatherCedulaError && <p className="text-xs text-red-500 mt-1">{fatherCedulaError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupación del Padre {familyPathCompletion.fatherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.father_occupation}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                      const length = value.length;

                      if (!isValid) {
                        setFatherOccupationError('Solo se permiten letras y espacios.');
                        return;
                      }

                      if (length > 40) {
                        setFatherOccupationError('Máximo 40 caracteres.');
                        return;
                      }

                      setFatherOccupationError('');
                      handleChange('family_information', 'father_occupation', value);
                      setFatherOccupationCharsLeft(40 - length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherOccupationError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder='Mín. 5 caracteres'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fatherOccupationCharsLeft} caracteres restantes (mín. 5, máx. 40)
                  </p>
                  {fatherOccupationError && <p className="text-xs text-red-500 mt-1">{fatherOccupationError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Padre {familyPathCompletion.fatherFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.father_phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setFatherPhoneError('');
                      handleChange('family_information', 'father_phone', digits);
                      setFatherPhoneCharsLeft(8 - digits.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="Ej: 88888888"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fatherPhoneCharsLeft} caracteres restantes (máximo 8, formato: 88888888)
                  </p>
                  {fatherPhoneError && <p className="text-xs text-red-500 mt-1">{fatherPhoneError}</p>}
                </div>
              </div>
              )}
            </div>
          )}

          {/* Persona Responsable (Legal Guardian) - Only show when guardian mode is selected */}
          {showLegalGuardian && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Persona Responsable (Encargado Legal)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Complete la información del encargado legal responsable del beneficiario.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Encargado Legal {familyPathCompletion.guardianFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.responsible_person}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                      const length = value.length;

                      if (!isValid) {
                        setResponsibleNameError('Solo se permiten letras y espacios.');
                        return;
                      }

                      if (length > 40) {
                        setResponsibleNameError('Máximo 40 caracteres.');
                        return;
                      }

                      setResponsibleNameError('');
                      handleChange('family_information', 'responsible_person', value);
                      setResponsibleNameCharsLeft(40 - length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsibleNameError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder={familyPathCompletion.guardianFieldsOptional ? 'Opcional' : 'Mín. 5 caracteres'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {responsibleNameCharsLeft} caracteres restantes (máximo. 40)
                  </p>
                  {responsibleNameError && <p className="text-xs text-red-500 mt-1">{responsibleNameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de cédula del encargado legal {familyPathCompletion.guardianFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={(form.family_information as FamilyInformation & { responsible_cedula?: string }).responsible_cedula ?? ''}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const isValid = /^\d*$/.test(rawValue);
                      const isLengthValid = rawValue.length <= 13;

                      if (!isValid) {
                        setResponsibleCedulaError('Solo se permiten números.');
                        return;
                      }

                      if (!isLengthValid) {
                        setResponsibleCedulaError('Máximo 13 caracteres.');
                        return;
                      }

                      setResponsibleCedulaError('');
                      handleChange('family_information', 'responsible_cedula', rawValue);
                      setResponsibleCedulaCharsLeft(13 - rawValue.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsibleCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="Nacional u Dimex."
                  />
                  {(() => {
                    const rCed = (form.family_information as FamilyInformation & { responsible_cedula?: string }).responsible_cedula ?? '';
                    return rCed.length < 9;
                  })() && (
                    <p className="text-xs text-gray-500 mt-1">
                      {responsibleCedulaCharsLeft} caracteres restantes (entre 9 y 13 dígitos)
                    </p>
                  )}
                {responsibleCedulaError && <p className="text-xs text-red-500 mt-1">{responsibleCedulaError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupación del Encargado Legal {familyPathCompletion.guardianFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.responsible_occupation}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                      const length = value.length;

                      if (!isValid) {
                        setResponsibleOccupationError('Solo se permiten letras y espacios.');
                        return;
                      }

                      if (length > 40) {
                        setResponsibleOccupationError('Máximo 40 caracteres.');
                        return;
                      }

                      setResponsibleOccupationError('');
                      handleChange('family_information', 'responsible_occupation', value);
                      setResponsibleOccupationCharsLeft(40 - length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsibleOccupationError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder='Mín. 5 caracteres'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {responsibleOccupationCharsLeft} caracteres restantes (mín. 5, máx. 40)
                  </p>
                  {responsibleOccupationError && <p className="text-xs text-red-500 mt-1">{responsibleOccupationError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Encargado Legal {familyPathCompletion.guardianFieldsOptional ? '(opcional)' : ''}
                  </label>
                  <input
                    type="text"
                    value={form.family_information.responsible_phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setResponsiblePhoneError('');
                      handleChange('family_information', 'responsible_phone', digits);
                      setResponsiblePhoneCharsLeft(8 - digits.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsiblePhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="Ej: 88888888"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {responsiblePhoneCharsLeft} caracteres restantes (máximo 8, formato: 88888888)
                  </p>
                  {responsiblePhoneError && <p className="text-xs text-red-500 mt-1">{responsiblePhoneError}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
        </>
        )}

        {currentStep === 2 && (
        <>
        {/* Datos de Discapacidad */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 min-w-0 overflow-hidden">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Información de Discapacidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0">
            <div className="md:col-span-2 md:row-span-2 space-y-3">
              <div>
                <label htmlFor="disability_type_primary" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Discapacidad 
                </label>
                <select
                  id="disability_type_primary"
                  name="disability_type_primary"
                  value={form.disability_information.disability_type[0] ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setDisabilityTypesError('');
                    setForm((prev) => {
                      const cur = prev.disability_information.disability_type;
                      if (!raw) {
                        return {
                          ...prev,
                          disability_information: {
                            ...prev.disability_information,
                            disability_type: cur.slice(1)
                          }
                        };
                      }
                      const v = raw as DisabilityTypeOption;
                      const rest = cur.slice(1).filter((t) => t !== v);
                      return {
                        ...prev,
                        disability_information: {
                          ...prev.disability_information,
                          disability_type: [v, ...rest]
                        }
                      };
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    disabilityTypesError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                >
                  <option value="">Seleccionar</option>
                  {DISABILITY_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {disabilityTypesCount < DISABILITY_TYPE_OPTIONS.length && (
                <>
                  {!showDisabilityTypeAddMore ? (
                    <button
                      type="button"
                      onClick={() => setShowDisabilityTypeAddMore(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline"
                    >
                      + Agregar otro tipo de discapacidad
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="disability_type_add_more" className="text-sm font-medium text-gray-700">
                          Agregar otro tipo
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDisabilityTypeAddMore(false);
                            setDisabilityTypeAddMore('');
                          }}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Ocultar
                        </button>
                      </div>
                      <select
                        id="disability_type_add_more"
                        name="disability_type_add_more"
                        value={disabilityTypeAddMore}
                        onChange={(e) => {
                          const v = e.target.value as DisabilityTypeOption | '';
                          if (v) {
                            setDisabilityTypesError('');
                            setForm((prev) => {
                              const cur = prev.disability_information.disability_type;
                              if (cur.includes(v)) return prev;
                              return {
                                ...prev,
                                disability_information: {
                                  ...prev.disability_information,
                                  disability_type: [...cur, v]
                                }
                              };
                            });
                          }
                          setDisabilityTypeAddMore('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccione un tipo adicional…</option>
                        {DISABILITY_TYPE_OPTIONS.filter(
                          (o) => !form.disability_information.disability_type.includes(o.value)
                        ).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {form.disability_information.disability_type.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {form.disability_information.disability_type.slice(1).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-blue-50 text-blue-900 text-sm border border-blue-200"
                    >
                      {DISABILITY_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t}
                      <button
                        type="button"
                        className="p-0.5 rounded-full hover:bg-blue-200 text-blue-800"
                        aria-label={`Quitar ${DISABILITY_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t}`}
                        onClick={() => {
                          setDisabilityTypesError('');
                          setForm((prev) => ({
                            ...prev,
                            disability_information: {
                              ...prev.disability_information,
                              disability_type: prev.disability_information.disability_type.filter((x) => x !== t)
                            }
                          }));
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {disabilityTypesError && (
                <p className="text-xs text-red-500">{disabilityTypesError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dictamen Médico *
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <p className="text-sm text-gray-600">
                  El dictamen médico debe ser subido como documento en la sección de "Documentos".
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Seguro *
              </label>
              <select
                name="insurance_type"
                value={form.disability_information.insurance_type ?? ''}
                onChange={(e) => {
                  setInsuranceTypeError('');
                  handleChange('disability_information', 'insurance_type', e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  insuranceTypeError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              >
                <option value="">Seleccionar</option>
                <option value="rnc">RnC (Regimen no contributivo)</option>
                <option value="independiente">Independiente</option>
                <option value="privado">Privado</option>
                <option value="otro">Otro</option>
              </select>
              {insuranceTypeError && (
                <p className="text-xs text-red-500 mt-1">{insuranceTypeError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origen de la Discapacidad *
              </label>
              <select
                name="disability_origin"
                value={form.disability_information.disability_origin ?? ''}
                onChange={(e) => {
                  setDisabilityOriginError('');
                  handleChange('disability_information', 'disability_origin', e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  disabilityOriginError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              >
                <option value="">Seleccionar</option>
                <option value="nacimiento">Nacimiento</option>
                <option value="accidente">Accidente</option>
                <option value="enfermedad">Enfermedad</option>
              </select>
              {disabilityOriginError && (
                <p className="text-xs text-red-500 mt-1">{disabilityOriginError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificado de Discapacidad *
              </label>
              <select
                name="disability_certificate"
                value={form.disability_information.disability_certificate ?? ''}
                onChange={(e) => {
                  setDisabilityCertificateError('');
                  handleChange('disability_information', 'disability_certificate', e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  disabilityCertificateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
                <option value="en_tramite">En trámite</option>
              </select>
              {disabilityCertificateError && (
                <p className="text-xs text-red-500 mt-1">{disabilityCertificateError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información Médica Adicional */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 min-w-0">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Información Médica Adicional</h3>
              <p className="text-sm text-gray-600">Complete la información médica relevante del beneficiario</p>
            </div>
          </div>

          {/* Información Básica Médica */}
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Sangre
                </label>
                <select
                  value={form.disability_information.medical_additional.blood_type ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      disability_information: {
                        ...prev.disability_information,
                        medical_additional: {
                          ...prev.disability_information.medical_additional,
                          blood_type: e.target.value as
                            | 'A+'
                            | 'A-'
                            | 'B+'
                            | 'B-'
                            | 'AB+'
                            | 'AB-'
                            | 'O+'
                            | 'O-'
                            | ''
                        }
                      }
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enfermedades que Padece <span className="text-gray-500 text-sm">(Opcional)</span>
                </label>
                <textarea
                  value={form.disability_information.medical_additional.diseases ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir letras, espacios, y signos de puntuación comunes (sin números)
                    const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-[\]{}"'/_]*$/.test(value);
                    const length = value.length;

                    if (!isValid) {
                      setDiseasesError('No se permiten números.');
                      return;
                    }

                    if (length > 200) {
                      setDiseasesError('Máximo 200 caracteres.');
                      return;
                    }

                    setDiseasesError('');
                    setForm(prev => ({
                      ...prev,
                      disability_information: {
                        ...prev.disability_information,
                        medical_additional: {
                          ...prev.disability_information.medical_additional,
                          diseases: value
                        }
                      }
                    }));
                    setDiseasesCharsLeft(200 - length);
                  }}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none ${diseasesError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="Describa las enfermedades que padece el beneficiario (Opcional)"
                />
                <p className="text-xs text-gray-500 mt-0.5">{diseasesCharsLeft} caracteres (máx. 200)</p>
                {diseasesError && <p className="text-xs text-red-500 mt-1">{diseasesError}</p>}
              </div>
            </div>
          </div>

          {/* Beneficios Biomecánicos */}
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
            <h4 className="text-base font-medium text-gray-800 mb-2">Beneficios Biomecánicos</h4>
            <p className="text-sm text-gray-600 mb-3">Seleccione los dispositivos de asistencia que utiliza el beneficiario</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                {
                  key: 'silla_ruedas',
                  label: 'Silla de ruedas',
                },
                {
                  key: 'baston',
                  label: 'Bastón',
                },
                {
                  key: 'andadera',
                  label: 'Andadera',
                },
                {
                  key: 'audifono',
                  label: 'Audífono',
                },
                {
                  key: 'baston_guia',
                  label: 'Bastón Guía',
                },
                {
                  key: 'otro',
                  label: 'Otro',
                }
              ].map((benefit) => (
                <label key={benefit.key} className={`flex items-center p-2.5 sm:p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${form.disability_information.medical_additional.biomechanical_benefit.some(b => b.type === benefit.key)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <input
                    type="checkbox"
                    checked={form.disability_information.medical_additional.biomechanical_benefit.some(b => b.type === benefit.key)}
                    onChange={(e) => {
                      const currentBenefits = form.disability_information.medical_additional.biomechanical_benefit;
                      if (e.target.checked) {
                        setForm(prev => ({
                          ...prev,
                          disability_information: {
                            ...prev.disability_information,
                            medical_additional: {
                              ...prev.disability_information.medical_additional,
                              biomechanical_benefit: [
                                ...currentBenefits,
                                { type: benefit.key as 'silla_ruedas' | 'baston' | 'andadera' | 'audifono' | 'baston_guia' | 'otro', other_description: benefit.key === 'otro' ? '' : undefined }
                              ]
                            }
                          }
                        }));
                      } else {
                        setForm(prev => ({
                          ...prev,
                          disability_information: {
                            ...prev.disability_information,
                            medical_additional: {
                              ...prev.disability_information.medical_additional,
                              biomechanical_benefit: currentBenefits.filter(b => b.type !== benefit.key)
                            }
                          }
                        }));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{benefit.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Limitaciones Permanentes */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <h4 className="text-base font-medium text-gray-800 mb-2">Limitaciones Permanentes</h4>
            <p className="text-sm text-gray-600 mb-3">Indique si presenta limitaciones permanentes y su grado de severidad (Opcional)</p>
            <div className="space-y-2">
              {[
                {
                  key: 'moverse_caminar',
                  label: 'Moverse/caminar',
                },
                {
                  key: 'ver_lentes',
                  label: 'Ver con lentes',
                },
                {
                  key: 'oir_audifono',
                  label: 'Oír con audífono',
                },
                {
                  key: 'comunicarse_hablar',
                  label: 'Comunicarse/hablar',
                },
                {
                  key: 'entender_aprender',
                  label: 'Entender/aprender',
                },
                {
                  key: 'relacionarse',
                  label: 'Relacionarse',
                }
              ].map((limitation) => (
                <div key={limitation.key} className="bg-gray-50 rounded-lg p-2.5 sm:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{limitation.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.disability_information.medical_additional.permanent_limitations.some(l => l.limitation === limitation.key)}
                          onChange={(e) => {
                            const currentLimitations = form.disability_information.medical_additional.permanent_limitations;
                            if (e.target.checked) {
                              setForm(prev => ({
                                ...prev,
                                disability_information: {
                                  ...prev.disability_information,
                                  medical_additional: {
                                    ...prev.disability_information.medical_additional,
                                    permanent_limitations: [
                                      ...currentLimitations,
                                      { limitation: limitation.key as 'moverse_caminar' | 'ver_lentes' | 'oir_audifono' | 'comunicarse_hablar' | 'entender_aprender' | 'relacionarse', degree: 'leve' }
                                    ]
                                  }
                                }
                              }));
                            } else {
                              setForm(prev => ({
                                ...prev,
                                disability_information: {
                                  ...prev.disability_information,
                                  medical_additional: {
                                    ...prev.disability_information.medical_additional,
                                    permanent_limitations: currentLimitations.filter(l => l.limitation !== limitation.key)
                                  }
                                }
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-600">Presente</span>
                      </label>
                      {form.disability_information.medical_additional.permanent_limitations.some(l => l.limitation === limitation.key) && (
                        <select
                          value={form.disability_information.medical_additional.permanent_limitations.find(l => l.limitation === limitation.key)?.degree || 'leve'}
                          onChange={(e) => {
                            const currentLimitations = form.disability_information.medical_additional.permanent_limitations;
                            const updatedLimitations = currentLimitations.map(l =>
                              l.limitation === limitation.key ? { ...l, degree: e.target.value as 'leve' | 'moderada' | 'severa' | 'no_se_sabe' } : l
                            );
                            setForm(prev => ({
                              ...prev,
                              disability_information: {
                                ...prev.disability_information,
                                medical_additional: {
                                  ...prev.disability_information.medical_additional,
                                  permanent_limitations: updatedLimitations
                                }
                              }
                            }));
                          }}
                          className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="leve">Leve</option>
                          <option value="moderada">Moderada</option>
                          <option value="severa">Severa</option>
                          <option value="no_se_sabe">No sabe</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
        )}

        {currentStep === 3 && (
        <>
        {/* Ficha Socioeconómica */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
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
                <option value="800k_1000k">De 800,000 a 1,000,000 colones</option>
                <option value="1000k_1300k">De 1,000,000 a 1,300,000 colones</option>
                <option value="mas_1300k">Más de 1,300,000 colones</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicios Disponibles
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { key: 'luz', label: 'Luz' },
                { key: 'agua', label: 'Agua' },
                { key: 'telefono', label: 'Teléfono' },
                { key: 'alcantarillado', label: 'Alcantarillado' },
                { key: 'internet', label: 'Internet' }
              ].map((service) => (
                <div key={service.key} className="flex items-center min-w-0">
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

          <div className="mt-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700 min-w-0">
                Personas que Trabajan en la Familia
              </label>
              <button
                type="button"
                onClick={addWorkingFamilyMember}
                disabled={!canAddWorkingFamilyMember}
                title={
                  !canAddWorkingFamilyMember
                    ? 'Complete correctamente todos los campos del familiar actual antes de agregar otro.'
                    : undefined
                }
                className="flex items-center justify-center gap-1 px-3 py-2 sm:py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 min-h-[44px] sm:min-h-0 touch-manipulation w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
              >
                <Plus className="w-4 h-4" />
                Agregar Familiar
              </button>
            </div>
            <div className="space-y-3">
              {form.socioeconomic_information.working_family_members.map((member, index) => {
                const rowErr = workingFamilyMemberErrors[index];
                const workingMemberNameCharsLeft = Math.max(
                  0,
                  WORKING_FAMILY_MEMBER_NAME_MAX - member.name.length
                );
                const workTypeCharsLeft = Math.max(0, WORKING_FAMILY_WORK_FIELD_MAX - member.work_type.length);
                const workPlaceCharsLeft = Math.max(0, WORKING_FAMILY_WORK_FIELD_MAX - member.work_place.length);
                const workPhoneCharsLeft = Math.max(
                  0,
                  WORKING_FAMILY_PHONE_DIGITS_MAX - member.work_phone.length
                );
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-gray-200 rounded min-w-0">
                    <div className="min-w-0 md:col-span-1">
                      <input
                        type="text"
                        placeholder="Nombre Completo"
                        value={member.name}
                        maxLength={WORKING_FAMILY_MEMBER_NAME_MAX}
                        onChange={(e) => updateWorkingFamilyMember(index, 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          rowErr?.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        autoComplete="name"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {workingMemberNameCharsLeft} caracteres restantes (mín. {WORKING_FAMILY_MEMBER_NAME_MIN}, máx.{' '}
                        {WORKING_FAMILY_MEMBER_NAME_MAX})
                      </p>
                      {rowErr?.name && <p className="text-xs text-red-500 mt-1">{rowErr.name}</p>}
                    </div>
                    <div className="min-w-0 md:col-span-1">
                      <input
                        type="text"
                        placeholder="Tipo de Trabajo"
                        value={member.work_type}
                        maxLength={WORKING_FAMILY_WORK_FIELD_MAX}
                        onChange={(e) => updateWorkingFamilyMember(index, 'work_type', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          rowErr?.work_type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {workTypeCharsLeft} caracteres restantes (máx. {WORKING_FAMILY_WORK_FIELD_MAX})
                      </p>
                      {rowErr?.work_type && <p className="text-xs text-red-500 mt-1">{rowErr.work_type}</p>}
                    </div>
                    <div className="min-w-0 md:col-span-1">
                      <input
                        type="text"
                        placeholder="Lugar de Trabajo"
                        value={member.work_place}
                        maxLength={WORKING_FAMILY_WORK_FIELD_MAX}
                        onChange={(e) => updateWorkingFamilyMember(index, 'work_place', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          rowErr?.work_place ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {workPlaceCharsLeft} caracteres restantes (máx. {WORKING_FAMILY_WORK_FIELD_MAX})
                      </p>
                      {rowErr?.work_place && <p className="text-xs text-red-500 mt-1">{rowErr.work_place}</p>}
                    </div>
                    <div className="min-w-0 md:col-span-1">
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Teléfono del Trabajo"
                        value={member.work_phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, WORKING_FAMILY_PHONE_DIGITS_MAX);
                          updateWorkingFamilyMember(index, 'work_phone', digits);
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          rowErr?.work_phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {workPhoneCharsLeft} caracteres restantes (máx. {WORKING_FAMILY_PHONE_DIGITS_MAX})
                      </p>
                      {rowErr?.work_phone && <p className="text-xs text-red-500 mt-1">{rowErr.work_phone}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWorkingFamilyMember(index)}
                      className="flex items-center justify-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md md:self-start"
                      aria-label="Eliminar familiar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {form.socioeconomic_information.working_family_members.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No hay familiares trabajando registrados. Haga clic en "Agregar Familiar" para comenzar.
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}

        {currentStep === 4 && (
        <>
        {/* Subida de Documentos — móvil: título legible + estado y archivo apilados */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Documentos Requeridos</h3>

          {documentsStepError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-700">
              {documentsStepError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
            {documentTypes.map((doc) => {
              const documentStatus = form.documentation_requirements.documents.find(d => d.document_type === doc.key)?.status || 'pendiente';
              const hasFile = documentFiles[doc.key];
              const statusLockedByFile = Boolean(hasFile);

              return (
                <div key={doc.key} className={`border rounded-lg p-2 sm:p-4 ${documentStatus === 'entregado' ? 'border-green-200 bg-green-50' :
                  documentStatus === 'en_tramite' ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200'
                }`}>
                  {/* Mobile: compact stack — still readable */}
                  <div className="flex sm:hidden flex-col gap-1.5 min-w-0">
                    <h4 className="text-[13px] font-semibold text-gray-900 leading-tight break-words">
                      {doc.label}
                      {doc.required && <span className="text-red-500 font-semibold"> *</span>}
                    </h4>
                    <label className="sr-only" htmlFor={`doc-status-${doc.key}`}>
                      Estado de {doc.label}
                    </label>
                    <select
                      id={`doc-status-${doc.key}`}
                      className="w-full text-xs border border-gray-300 rounded-md px-2.5 py-2 bg-white min-h-[40px] touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                      value={documentStatus}
                      disabled={statusLockedByFile}
                      title={statusLockedByFile ? 'Quite el archivo adjunto para poder cambiar el estado.' : undefined}
                      onChange={(e) => {
                        const status = e.target.value as 'pendiente' | 'entregado' | 'en_tramite' | 'no_aplica';
                        updateDocumentStatus(doc.key, status);
                      }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="entregado">Entregado</option>
                      <option value="en_tramite">En trámite</option>
                      <option value="no_aplica">No aplica</option>
                    </select>
                    <div className="flex items-stretch gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[doc.key]?.click()}
                        className="flex-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-2 rounded-md min-h-[40px] touch-manipulation active:bg-blue-100"
                      >
                        Elegir archivo
                      </button>
                      {hasFile && (
                        <button
                          type="button"
                          onClick={() => handleDocumentChange(doc.key, null)}
                          className="flex-shrink-0 flex items-center justify-center px-2 border border-red-200 rounded-md text-red-600 bg-red-50 min-h-[40px] min-w-[40px] touch-manipulation"
                          aria-label="Quitar archivo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {documentStatus === 'entregado' && !hasFile && (
                      <div className="flex items-center gap-1.5 text-[11px] text-green-800 bg-green-100/80 border border-green-200 rounded px-2 py-1.5 leading-snug">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-600" />
                        <span>Ya entregado / registrado en el sistema.</span>
                      </div>
                    )}
                    {hasFile && (
                      <p className="text-xs text-green-700 break-all leading-snug">
                        <span className="font-medium text-green-800">Seleccionado: </span>
                        {documentFiles[doc.key]?.name}
                      </p>
                    )}
                    {statusLockedByFile && (
                      <p className="text-[11px] text-gray-600">Para cambiar el estado, quite primero el archivo con ✕.</p>
                    )}
                  </div>
                  {/* Desktop: full card */}
                  <div className="hidden sm:block">
                    {documentStatus === 'entregado' && !hasFile && (
                      <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Documento entregado a ASONIPED.</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">{doc.label} {doc.required && <span className="text-red-500">*</span>}</label>
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                          value={documentStatus}
                          disabled={statusLockedByFile}
                          title={statusLockedByFile ? 'Quite el archivo adjunto para poder cambiar el estado.' : undefined}
                          onChange={(e) => {
                            const status = e.target.value as 'pendiente' | 'entregado' | 'en_tramite' | 'no_aplica';
                            updateDocumentStatus(doc.key, status);
                          }}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="entregado">Entregado</option>
                          <option value="en_tramite">En trámite</option>
                          <option value="no_aplica">No aplica</option>
                        </select>
                      </div>
                      {hasFile && (
                        <button type="button" onClick={() => handleDocumentChange(doc.key, null)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {hasFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-green-600">✓</span>
                        <p className="text-xs text-green-600">{documentFiles[doc.key]?.name}</p>
                      </div>
                    )}
                    {statusLockedByFile && (
                      <p className="mt-1 text-xs text-gray-600">Para cambiar el estado, quite primero el archivo.</p>
                    )}
                  </div>
                  <input
                    ref={el => { fileInputRefs.current[doc.key] = el; }}
                    type="file"
                    onChange={(e) => handleDocumentChange(doc.key, e.target.files?.[0] || null)}
                    className="hidden sm:block w-full text-base text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 min-h-[44px]"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required={doc.required && documentStatus !== 'entregado'}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-5 pt-3 border-t border-gray-200">
            <h4 className="text-[11px] sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">Adicionales (opcional)</h4>
            <p className="sm:hidden text-[10px] text-gray-500 mb-1.5 leading-snug">
              Hasta {MAX_RECORD_UPLOAD_FILES} archivos (papelera = quitar fila).
            </p>
            <p className="hidden sm:block text-[11px] sm:text-xs text-gray-600 mb-2 leading-snug">
              Agregue otros archivos con un título descriptivo. Puede editar el título o reemplazar el archivo; use eliminar para quitar la fila.
              Total máximo de archivos en este paso: {MAX_RECORD_UPLOAD_FILES}.
            </p>
            <div className="space-y-1.5 sm:space-y-2">
              {extraDocuments.map((row, idx) => (
                <div
                  key={row.id}
                  className="relative rounded-md sm:rounded-lg border border-gray-200 bg-white p-2 sm:p-2.5 md:p-3 shadow-sm"
                >
                  <div className="flex items-start gap-1 pr-8 sm:gap-1.5 sm:pr-9">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] sm:text-[11px] font-medium text-gray-700 mb-0 sm:mb-0.5" htmlFor={`extra-doc-title-${row.id}`}>
                        <span className="sm:hidden">Título · doc. {idx + 1}</span>
                        <span className="hidden sm:inline">Título del documento {idx + 1}</span>
                      </label>
                      <input
                        id={`extra-doc-title-${row.id}`}
                        type="text"
                        value={row.title}
                        maxLength={40}
                        onChange={(e) => {
                          const v = e.target.value;
                          setExtraDocuments(prev =>
                            prev.map(r => (r.id === row.id ? { ...r, title: v } : r))
                          );
                        }}
                        className="w-full text-[11px] sm:text-xs border border-gray-300 rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-400"
                        placeholder="Ej: Constancia adicional…"
                        required
                      />
                      <p className="hidden sm:block text-xs text-gray-500 mt-1">
                        {40 - row.title.length} caracteres restantes (máximo 40)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExtraDocuments(prev => prev.filter(r => r.id !== row.id));
                      const inp = extraFileInputRefs.current[row.id];
                      if (inp) inp.value = '';
                      delete extraFileInputRefs.current[row.id];
                    }}
                    className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors touch-manipulation"
                    aria-label="Eliminar fila de documento adicional"
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>

                  <div className="mt-1.5 sm:hidden flex items-stretch gap-1">
                    <button
                      type="button"
                      onClick={() => extraFileInputRefs.current[row.id]?.click()}
                      className="inline-flex flex-1 min-w-0 items-center justify-center gap-1 rounded-md bg-indigo-600 px-2 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 min-h-[36px] touch-manipulation"
                    >
                      <Upload className="w-3 h-3 shrink-0 opacity-90" />
                      Archivo
                    </button>
                    {row.file && (
                      <button
                        type="button"
                        onClick={() => {
                          setExtraDocuments(prev =>
                            prev.map(r => (r.id === row.id ? { ...r, file: null } : r))
                          );
                          const inp = extraFileInputRefs.current[row.id];
                          if (inp) inp.value = '';
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white px-2 text-gray-600 hover:bg-gray-50 min-h-[36px] min-w-[36px] touch-manipulation"
                        aria-label="Quitar archivo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={el => {
                      extraFileInputRefs.current[row.id] = el;
                    }}
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setExtraDocuments(prev =>
                        prev.map(r => (r.id === row.id ? { ...r, file: f } : r))
                      );
                    }}
                    className="hidden sm:block w-full mt-1.5 text-xs text-gray-600 file:mr-2 file:cursor-pointer file:rounded-md file:border file:border-indigo-200 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-50 file:shadow-sm min-h-[38px]"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />

                  {row.file && (
                    <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] text-green-700 break-all leading-snug line-clamp-2 sm:line-clamp-none">
                      <span className="font-medium text-green-800 sm:font-medium">
                        <span className="sm:hidden">✓ </span>
                        <span className="hidden sm:inline">Seleccionado: </span>
                      </span>
                      {row.file.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const id =
                  typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? crypto.randomUUID()
                    : `ex-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                setExtraDocuments(prev => [...prev, { id, title: '', file: null }]);
              }}
              className="mt-2 sm:mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md border border-dashed border-indigo-200 bg-indigo-50/50 px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-medium text-indigo-800 hover:border-indigo-300 hover:bg-indigo-50 min-h-[36px] sm:min-h-[40px] touch-manipulation"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="sm:hidden">Otro documento</span>
              <span className="hidden sm:inline">Agregar otro documento</span>
            </button>
          </div>
        </div>

        </>
        )}

        {currentStep === 5 && (
        <>
        {submitError && (
          <div className="mb-4 sm:mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-red-800">No se pudo completar el envío</h4>
                <p className="mt-1 text-sm text-red-700 break-words">{submitError}</p>
                <p className="mt-2 text-xs text-red-600">
                  En unos segundos se abrirá el paso Documentos para que vuelva a cargar los archivos. También puede ir ahora.
                </p>
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-2 hover:text-red-900"
                  onClick={() => submitError && applyDocumentRetryReset(submitError)}
                >
                  Ir a Documentos ahora
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Documentación y Requisitos (step 6) */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documentación y Requisitos</h3>

          {/* Información de pago */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-y-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                <h4 className="font-medium text-blue-900 text-sm sm:text-base">Información de Pago</h4>
              </div>
              <span className="text-xs sm:text-sm text-blue-800">500 colones · Sinpe: 8888-8888</span>
              <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium text-blue-900 whitespace-nowrap">Estado:</label>
                <select
                  value={form.documentation_requirements.affiliation_fee_paid ? 'pagada' : 'pendiente'}
                  onChange={(e) => handleChange('documentation_requirements', 'affiliation_fee_paid', e.target.value === 'pagada')}
                  className="flex-1 sm:flex-initial min-w-0 px-2 py-1.5 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">Subir comprobante en Documentos requeridos.</p>
          </div>

          {/* Resumen de documentos */}
          <div className="mt-4 sm:mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 min-w-0">
            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Resumen de Documentación</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm min-w-0">
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

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales</label>
              <p className="text-xs text-gray-500">
                Opcional. Hasta {MAX_GENERAL_OBSERVATION_NOTE_COUNT} notas, {MAX_GENERAL_OBSERVATION_NOTE_LENGTH} caracteres cada una.
              </p>
            </div>
            {generalObservationsRowsForUi.map((text, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-medium text-gray-600">Nota {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeGeneralObservationsRow(idx)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 touch-manipulation"
                    aria-label={`Eliminar observación ${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => updateGeneralObservationsRow(idx, e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
                    generalObsRowErrors[idx]
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Opcional"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.max(0, MAX_GENERAL_OBSERVATION_NOTE_LENGTH - text.length)} caracteres restantes (máximo{' '}
                  {MAX_GENERAL_OBSERVATION_NOTE_LENGTH})
                </p>
                {generalObsRowErrors[idx] && (
                  <p className="text-xs text-red-500 mt-1">{generalObsRowErrors[idx]}</p>
                )}
              </div>
            ))}
            {generalObservationsRowsForUi.length < MAX_GENERAL_OBSERVATION_NOTE_COUNT && (
              <button
                type="button"
                onClick={addGeneralObservationsRow}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 touch-manipulation"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                Agregar otra observación
              </button>
            )}
            {generalObservationsError && (
              <p className="text-xs text-red-500">{generalObservationsError}</p>
            )}
          </div>
        </div>
        </>
        )}

        

        {/* Step navigation: sticky on mobile, safe area, full-width touch targets */}
        <div
          className="min-w-0 sticky bottom-0 z-10 mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)] sm:shadow-none"
        >
          <div className="w-full sm:w-auto">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={goToPrevStep}
                className="w-full sm:w-auto min-h-[48px] px-4 py-3 sm:py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 font-medium touch-manipulation"
              >
                Anterior
              </button>
            ) : (
              <span className="block sm:hidden" aria-hidden />
            )}
          </div>
          <div className="w-full sm:w-auto flex-1 sm:flex-initial flex justify-end">
            {currentStep < LAST_STEP_INDEX ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToNextStep();
                }}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 font-medium flex items-center justify-center gap-2 touch-manipulation"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-h-[48px] bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium touch-manipulation"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {isAdminEdit ? 'Guardar Cambios' :
                      isAdminCreation ? 'Crear Expediente' :
                        isModification ? 'Actualizar Expediente' :
                          'Completar Expediente'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>


  );
};

export default Phase3Form;
