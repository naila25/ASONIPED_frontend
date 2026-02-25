import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Upload, X, Plus, Trash2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Phase3Data, RecordWithDetails, RequiredDocument, AvailableService, FamilyInformation } from '../Types/records';
import { useAuth } from '../../Login/Hooks/useAuth';
import { getProvinces, getCantonsByProvince, getDistrictsByCanton, type Province, type Canton, type District } from '../Services/geographicApi';

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
  resetTrigger = 0
}) => {
  const { user } = useAuth();

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
  const [primaryPhoneCharsLeft, setPrimaryPhoneCharsLeft] = useState(9);

  const [secondaryPhoneError, setSecondaryPhoneError] = useState('');
  const [secondaryPhoneCharsLeft, setSecondaryPhoneCharsLeft] = useState(9);

  const [cedulaError, setCedulaError] = useState('');
  const [cedulaCharsLeft, setCedulaCharsLeft] = useState(9);

  const [birthPlaceError, setBirthPlaceError] = useState('');
  const [birthPlaceCharsLeft, setBirthPlaceCharsLeft] = useState(20);

  const [addressError, setAddressError] = useState('');
  const [addressCharsLeft, setAddressCharsLeft] = useState(150);

  // === Validaciones para Información Familiar ===

  // Madre
  const [motherNameError, setMotherNameError] = useState('');
  const [motherNameCharsLeft, setMotherNameCharsLeft] = useState(40);

  const [motherCedulaError, setMotherCedulaError] = useState('');
  const [motherCedulaCharsLeft, setMotherCedulaCharsLeft] = useState(9);

  const [motherOccupationError, setMotherOccupationError] = useState('');
  const [motherOccupationCharsLeft, setMotherOccupationCharsLeft] = useState(40);

  const [motherPhoneError, setMotherPhoneError] = useState('');
  const [motherPhoneCharsLeft, setMotherPhoneCharsLeft] = useState(9);

  // Padre
  const [fatherNameError, setFatherNameError] = useState('');
  const [fatherNameCharsLeft, setFatherNameCharsLeft] = useState(40);

  const [fatherCedulaError, setFatherCedulaError] = useState('');
  const [fatherCedulaCharsLeft, setFatherCedulaCharsLeft] = useState(9);

  const [fatherOccupationError, setFatherOccupationError] = useState('');
  const [fatherOccupationCharsLeft, setFatherOccupationCharsLeft] = useState(40);

  const [fatherPhoneError, setFatherPhoneError] = useState('');
  const [fatherPhoneCharsLeft, setFatherPhoneCharsLeft] = useState(9);

  // === Validaciones para Encargado Legal ===

  const [responsibleNameError, setResponsibleNameError] = useState('');
  const [responsibleNameCharsLeft, setResponsibleNameCharsLeft] = useState(40);

  const [responsibleCedulaError, setResponsibleCedulaError] = useState('');
  const [responsibleCedulaCharsLeft, setResponsibleCedulaCharsLeft] = useState(9);

  const [responsibleOccupationError, setResponsibleOccupationError] = useState('');
  const [responsibleOccupationCharsLeft, setResponsibleOccupationCharsLeft] = useState(40);

  const [responsiblePhoneError, setResponsiblePhoneError] = useState('');
  const [responsiblePhoneCharsLeft, setResponsiblePhoneCharsLeft] = useState(9);

  // === Validaciones para Información Médica ===
  const [diseasesError, setDiseasesError] = useState('');
  const [diseasesCharsLeft, setDiseasesCharsLeft] = useState(50);

  // observaciones generales
  const [generalObservationsError, setGeneralObservationsError] = useState('');
  const [generalObservationsCharsLeft, setGeneralObservationsCharsLeft] = useState(200);

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

  // Multi-step form: 0 = Personal, 1 = Family, 2 = Disability+Medical, 3 = Socioeconomic, 4 = Documents
  const TOTAL_STEPS = 6;
  const LAST_STEP_INDEX = TOTAL_STEPS - 1; // 5 = Requisitos y Pago (only step that submits)
  const STEP_LABELS = ['Datos Personales', 'Información Familiar', 'Discapacidad y Salud', 'Ficha Socioeconómica', 'Subir Documentos', 'Requisitos y Pago'];
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
      disability_type: 'fisica',
      medical_diagnosis: '',
      insurance_type: 'rnc',
      disability_origin: 'nacimiento',
      disability_certificate: 'no',
      conapdis_registration: 'no',
      medical_additional: {
        diseases: '',
        blood_type: 'A+' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
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
      console.log('🔄 Resetting form due to resetTrigger change');
      setForm(getInitialFormState());
      setDocumentFiles({
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
      });
      setShowParents(true);
      setShowLegalGuardian(false);
      setCurrentStep(0);
      setStepperViewStart(0);
    }
  }, [resetTrigger]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [documentFiles, setDocumentFiles] = useState<{ [key: string]: File | null }>({
    dictamen_medico: null,
    constancia_nacimiento: null,
    copia_cedula: null,
    copias_cedulas_familia: null,
    foto_pasaporte: null,
    constancia_pension_ccss: null,
    constancia_pension_alimentaria: null,
    constancia_estudio: null,
    cuenta_banco_nacional: null,
    informacion_pago: null
  });

  // Estado para documentos genéricos que necesitan asignación manual
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

  // Pre-fill data from existing Phase 3 data when it's a modification
  useEffect(() => {
    if (isModification && currentRecord) {
      console.log('=== PRE-FILLING PHASE 3 FORM FOR MODIFICATION ===');
      console.log('Current record:', currentRecord);

      setForm(prev => {
        const newForm = { ...prev };

        // Pre-fill complete personal data
        if (currentRecord.complete_personal_data) {
          console.log('Pre-filling complete personal data:', currentRecord.complete_personal_data);
          newForm.complete_personal_data = {
            ...prev.complete_personal_data,
            ...currentRecord.complete_personal_data,
            registration_date: formatDateForInput(currentRecord.complete_personal_data.registration_date) || new Date().toISOString().split('T')[0],
            birth_date: formatDateForInput(currentRecord.complete_personal_data.birth_date) || ''
          };
        }

        // Pre-fill family information
        if (currentRecord.family_information) {
          console.log('Pre-filling family information:', currentRecord.family_information);
          newForm.family_information = {
            ...prev.family_information,
            ...currentRecord.family_information
          };
        }

        // Pre-fill disability information
        if (currentRecord.disability_information) {
          console.log('Pre-filling disability information:', currentRecord.disability_information);
          newForm.disability_information = {
            ...prev.disability_information,
            ...currentRecord.disability_information
          };
        }

        // Pre-fill socioeconomic information
        if (currentRecord.socioeconomic_information) {
          console.log('Pre-filling socioeconomic information:', currentRecord.socioeconomic_information);
          newForm.socioeconomic_information = {
            ...prev.socioeconomic_information,
            ...currentRecord.socioeconomic_information
          };
        }

        // Pre-fill documentation requirements
        if (currentRecord.documentation_requirements) {
          console.log('Pre-filling documentation requirements:', currentRecord.documentation_requirements);
          console.log('affiliation_fee_paid value:', currentRecord.documentation_requirements.affiliation_fee_paid);
          console.log('affiliation_fee_paid type:', typeof currentRecord.documentation_requirements.affiliation_fee_paid);
          newForm.documentation_requirements = {
            ...prev.documentation_requirements,
            ...currentRecord.documentation_requirements,
            // Ensure affiliation_fee_paid is properly handled
            affiliation_fee_paid: currentRecord.documentation_requirements.affiliation_fee_paid || false
          };
        }

        return newForm;
      });
    }
  }, [isModification, currentRecord, isAdminCreation, isAdminEdit]);

  // Pre-fill data from Phase 1 when component mounts (for new records)
  useEffect(() => {
    if (!isModification && currentRecord?.personal_data) {
      const phase1Data = currentRecord.personal_data;

      console.log('Pre-filling Phase 3 form with Phase 1 data:', phase1Data);

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
          mother_phone: phase1Data.mother_phone || '',
          father_name: phase1Data.father_name || '',
          father_cedula: phase1Data.father_cedula || '',
          father_phone: phase1Data.father_phone || '',
          // Pre-fill legal guardian info if available
          responsible_person: phase1Data.legal_guardian_name || '',
          responsible_cedula: phase1Data.legal_guardian_cedula || '',
          responsible_phone: phase1Data.legal_guardian_phone || ''
        },
        disability_information: {
          ...prev.disability_information,
          // Pre-fill disability type from Phase 1
          disability_type: (phase1Data.pcd_name as 'fisica' | 'visual' | 'auditiva' | 'psicosocial' | 'cognitiva' | 'intelectual' | 'multiple') || 'fisica'
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
    }
  }, [currentRecord, user, isModification, isAdminCreation, isAdminEdit]);

  // Pre-load cantons and districts when form is pre-filled with Phase 1 data
  useEffect(() => {
    const preloadGeographicData = async () => {
      if (currentRecord?.personal_data && provinces.length > 0) {
        const phase1Data = currentRecord.personal_data;

        console.log('Preloading geographic data:', {
          province: phase1Data.province,
          canton: phase1Data.canton,
          district: phase1Data.district,
          provincesLoaded: provinces.length
        });

        // Load cantons if province is pre-filled
        if (phase1Data.province) {
          try {
            const selectedProvince = provinces.find(p => p.name === phase1Data.province);
            console.log('Selected province for preloading:', selectedProvince);

            if (selectedProvince) {
              setLoadingCantons(true);
              const cantonsData = await getCantonsByProvince(selectedProvince.id);
              console.log('Loaded cantons for preloading:', cantonsData.length);
              setCantons(cantonsData);
              setLoadingCantons(false);

              // Load districts if canton is pre-filled
              if (phase1Data.canton) {
                const selectedCanton = cantonsData.find(c => c.name === phase1Data.canton);
                console.log('Selected canton for preloading:', selectedCanton);

                if (selectedCanton) {
                  setLoadingDistricts(true);
                  const districtsData = await getDistrictsByCanton(selectedCanton.id);
                  console.log('Loaded districts for preloading:', districtsData.length);
                  setDistricts(districtsData);
                  setLoadingDistricts(false);
                }
              }
            }
          } catch (error) {
            console.error('Error preloading geographic data:', error);
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
      } catch (error) {
        console.error('Error loading provinces:', error);
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
        } catch (error) {
          console.error('Error loading cantons:', error);
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
        } catch (error) {
          console.error('Error loading districts:', error);
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
    { key: 'cuenta_banco_nacional', label: 'Cuenta Banco Nacional', required: false },
    { key: 'informacion_pago', label: 'Información de Pago', required: true }
  ], []);

  // Initialize document status based on existing documents
  useEffect(() => {
    // Always initialize documents array, even if no existing documents
    setForm(prev => ({
      ...prev,
      documentation_requirements: {
        ...prev.documentation_requirements,
        documents: documentTypes.map(doc => ({
          document_type: doc.key as RequiredDocument['document_type'],
          status: 'pendiente',
          observations: ''
        }))
      }
    }));

    // If there are existing documents, update their status
    console.log('=== CHECKING FOR EXISTING DOCUMENTS ===');
    console.log('Current record:', currentRecord);
    console.log('Current record documents:', currentRecord?.documents);
    console.log('Documents length:', currentRecord?.documents?.length || 0);

    if (currentRecord?.documents && currentRecord.documents.length > 0) {
      const existingDocuments = currentRecord.documents;
      console.log('=== LOADING EXISTING DOCUMENTS ===');
      console.log('Existing documents:', existingDocuments);

      // Create a mapping of document types to their status
      const documentStatusMap = new Map();
      existingDocuments.forEach(doc => {
        // Map backend document types to form document types
        const formDocumentType = mapBackendDocumentType(doc.document_type, doc.file_name);
        if (formDocumentType) {
          documentStatusMap.set(formDocumentType, 'entregado');
          console.log(`Document ${doc.document_type} (${doc.file_name}) mapped to ${formDocumentType} with status entregado`);
        } else {
          console.log(`Document ${doc.document_type} (${doc.file_name}) could not be mapped to form document type`);
        }

        // Special handling for payment_info documents
        if ((doc.document_type as string) === 'payment_info') {
          documentStatusMap.set('informacion_pago', 'entregado');
          console.log(`Payment info document mapped to informacion_pago with status entregado`);
        }
      });

      console.log('Document status map:', documentStatusMap);

      // Update form with existing document statuses
      const updatedDocuments = documentTypes.map(doc => ({
        document_type: doc.key as RequiredDocument['document_type'],
        status: documentStatusMap.get(doc.key) || 'pendiente',
        observations: ''
      }));

      console.log('Updated form documents before setForm:', updatedDocuments);

      // Check if payment information document is entregado and set payment status accordingly
      const paymentDocStatus = documentStatusMap.get('informacion_pago');
      const isPaymentPaid = paymentDocStatus === 'entregado';

      console.log('Payment document status:', paymentDocStatus);
      console.log('Setting affiliation_fee_paid to:', isPaymentPaid);

      setForm(prev => ({
        ...prev,
        documentation_requirements: {
          ...prev.documentation_requirements,
          documents: updatedDocuments,
          affiliation_fee_paid: isPaymentPaid
        }
      }));

      console.log('Updated form documents after setForm:', updatedDocuments);
    }
  }, [currentRecord, documentTypes]);

  // Helper function to map backend document types to form document types
  const mapBackendDocumentType = (backendType: string, fileName?: string): string | null => {
    console.log(`Mapping backend type: ${backendType}, fileName: ${fileName}`);

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

    const result = mapping[backendType] || null;
    console.log(`Mapped ${backendType} to ${result}`);
    return result;
  };

  // Debug: Log form state changes
  useEffect(() => {
    console.log('Form state updated:', {
      documents: form.documentation_requirements.documents,
      documentFiles: Object.keys(documentFiles).filter(key => documentFiles[key] !== null)
    });

    // Specifically log document statuses
    console.log('Document statuses in form:', form.documentation_requirements.documents.map(doc => ({
      type: doc.document_type,
      status: doc.status
    })));
  }, [form.documentation_requirements.documents, documentFiles]);

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
    console.log('handleDocumentChange called:', { documentType, file: file?.name });

    setDocumentFiles(prev => ({
      ...prev,
      [documentType]: file
    }));

    // Actualizar automáticamente el estado del documento cuando se sube un archivo
    if (file) {
      console.log('File uploaded, updating document status to entregado');

      setForm(prev => {
        const existingDoc = prev.documentation_requirements.documents.find(doc => doc.document_type === documentType);
        console.log('Existing doc:', existingDoc);

        if (existingDoc) {
          // Update existing document status to 'entregado'
          const updatedDocs = prev.documentation_requirements.documents.map(doc =>
            doc.document_type === documentType ? { ...doc, status: 'entregado' as const } : doc
          );
          console.log('Updated docs:', updatedDocs);

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
            console.log('Payment information document uploaded, setting affiliation_fee_paid to true');
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
          console.log('Added new doc:', updatedDocs);

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
            console.log('Payment information document uploaded, setting affiliation_fee_paid to true');
          }

          return updatedForm;
        }
      });
    } else {
      console.log('File removed, updating document status to pendiente');

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
            console.log('Payment information document removed, setting affiliation_fee_paid to false');
          }

          return updatedForm;
        }
        return prev;
      });
    }
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
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(fullName) || fullName.length < 5 || fullName.length > 30) {
      setFullNameError(fullName.length < 5 && fullName.length > 0 ? 'Mínimo 5 caracteres.' : fullName.length > 30 ? 'Máximo 30 caracteres.' : 'Solo se permiten letras y espacios.');
      ok = false;
    } else setFullNameError('');
    const primaryPhone = form.complete_personal_data.primary_phone;
    if (!/^\d{4}-\d{4}$/.test(primaryPhone)) {
      setPrimaryPhoneError('Formato inválido. Use 9999-9999.');
      ok = false;
    } else setPrimaryPhoneError('');
    const secondaryPhone = form.complete_personal_data.secondary_phone;
    if (secondaryPhone && !/^\d{4}-\d{4}$/.test(secondaryPhone)) {
      setSecondaryPhoneError('Formato inválido. Use 9999-9999.');
      ok = false;
    } else setSecondaryPhoneError('');
    const cedula = form.complete_personal_data.cedula;
    if (!/^\d+$/.test(cedula) || cedula.length > 9 || cedula.length === 0) {
      setCedulaError(cedula.length === 0 ? 'Este campo es obligatorio.' : cedula.length > 9 ? 'Máximo 9 caracteres.' : 'Solo se permiten números.');
      ok = false;
    } else setCedulaError('');
    const birthPlace = form.complete_personal_data.birth_place;
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(birthPlace) || birthPlace.length > 40 || birthPlace.length === 0) {
      setBirthPlaceError(birthPlace.length === 0 ? 'Este campo es obligatorio.' : birthPlace.length > 40 ? 'Máximo 40 caracteres.' : 'Solo se permiten letras y espacios.');
      ok = false;
    } else setBirthPlaceError('');
    const exactAddress = form.complete_personal_data.exact_address;
    if (exactAddress.length === 0) {
      setAddressError('Este campo es obligatorio.');
      ok = false;
    } else if (exactAddress.length > 150) {
      setAddressError('Máximo 150 caracteres.');
      ok = false;
    } else setAddressError('');
    return ok;
  };

  const validateStepFamily = (): boolean => {
    let ok = true;
    if (showParents) {
      const mCed = form.family_information.mother_cedula;
      if (mCed && (mCed.length !== 9 || !/^\d+$/.test(mCed))) {
        setMotherCedulaError('La cédula debe tener 9 dígitos numéricos.');
        ok = false;
      } else setMotherCedulaError('');
      const mName = form.family_information.mother_name;
      if (mName && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(mName) || mName.length < 5 || mName.length > 30)) {
        setMotherNameError(mName.length < 5 ? 'Mínimo 5 caracteres.' : mName.length > 30 ? 'Máximo 30 caracteres.' : 'Solo letras y espacios.');
        ok = false;
      } else setMotherNameError('');
      const mOcc = form.family_information.mother_occupation;
      if (mOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(mOcc) || mOcc.length > 20)) {
        setMotherOccupationError('Máximo 20 caracteres, solo letras.');
        ok = false;
      } else setMotherOccupationError('');
      const mPhone = form.family_information.mother_phone;
      if (mPhone && !/^\d{4}-\d{4}$/.test(mPhone)) {
        setMotherPhoneError('Formato inválido. Use 9999-9999.');
        ok = false;
      } else setMotherPhoneError('');
      const fCed = form.family_information.father_cedula;
      if (fCed && (fCed.length !== 9 || !/^\d+$/.test(fCed))) {
        setFatherCedulaError('La cédula debe tener 9 dígitos numéricos.');
        ok = false;
      } else setFatherCedulaError('');
      const fName = form.family_information.father_name;
      if (fName && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(fName) || fName.length < 5 || fName.length > 30)) {
        setFatherNameError(fName.length < 5 ? 'Mínimo 5 caracteres.' : fName.length > 30 ? 'Máximo 30 caracteres.' : 'Solo letras y espacios.');
        ok = false;
      } else setFatherNameError('');
      const fOcc = form.family_information.father_occupation;
      if (fOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(fOcc) || fOcc.length > 20)) {
        setFatherOccupationError('Máximo 20 caracteres, solo letras.');
        ok = false;
      } else setFatherOccupationError('');
      const fPhone = form.family_information.father_phone;
      if (fPhone && !/^\d{4}-\d{4}$/.test(fPhone)) {
        setFatherPhoneError('Formato inválido. Use 9999-9999.');
        ok = false;
      } else setFatherPhoneError('');
    }
    const responsibleName = form.family_information.responsible_person;
    if (showLegalGuardian && responsibleName && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(responsibleName) || responsibleName.length < 5 || responsibleName.length > 30)) {
      setResponsibleNameError(responsibleName.length < 5 ? 'Mínimo 5 caracteres.' : responsibleName.length > 30 ? 'Máximo 30 caracteres.' : 'Solo se permiten letras y espacios.');
      ok = false;
    } else setResponsibleNameError('');
    if (showLegalGuardian) {
      const rCed = (form.family_information as FamilyInformation & { responsible_cedula?: string }).responsible_cedula;
      if (rCed && (rCed.length !== 9 || !/^\d+$/.test(rCed))) {
        setResponsibleCedulaError('La cédula debe tener 9 dígitos numéricos.');
        ok = false;
      } else setResponsibleCedulaError('');
    }
    const rOcc = form.family_information.responsible_occupation;
    if (rOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(rOcc) || rOcc.length > 20)) {
      setResponsibleOccupationError('Máximo 20 caracteres, solo letras.');
      ok = false;
    } else setResponsibleOccupationError('');
    const rPhone = form.family_information.responsible_phone;
    if (rPhone && !/^\d{4}-\d{4}$/.test(rPhone)) {
      setResponsiblePhoneError('Formato inválido. Use 9999-9999.');
      ok = false;
    } else setResponsiblePhoneError('');
    return ok;
  };

  const validateStepDisability = (): boolean => {
    const diseases = form.disability_information.medical_additional.diseases;
    if (diseases && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-[\]{}"'/_]*$/.test(diseases) || diseases.length > 200)) {
      setDiseasesError(diseases.length > 200 ? 'Máximo 200 caracteres.' : 'No se permiten números.');
      return false;
    }
    setDiseasesError('');
    return true;
  };

  const validateStepSocioeconomic = (): boolean => {
    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 0 && !validateStepPersonal()) return;
    if (currentStep === 1 && !validateStepFamily()) return;
    if (currentStep === 2 && !validateStepDisability()) return;
    if (currentStep === 3 && !validateStepSocioeconomic()) return;
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goToPrevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== LAST_STEP_INDEX) {
      goToNextStep();
      return;
    }
    console.log('=== FORM SUBMISSION HANDLER CALLED ===');
    console.log('Is modification:', isModification);
    console.log('Document files:', documentFiles);
    console.log('Form documents:', form.documentation_requirements.documents);
    console.log('Loading state:', loading);
    console.log('Form state:', form);

    // Validaciones manuales antes del envío
    let hasErrors = false;

    // Nombre completo
    const fullName = form.complete_personal_data.full_name;
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(fullName) || fullName.length < 5 || fullName.length > 30) {
      setFullNameError(fullName.length < 5 && fullName.length > 0 ? 'Mínimo 5 caracteres.' :
        fullName.length > 30 ? 'Máximo 30 caracteres.' :
          'Solo se permiten letras y espacios.');
      hasErrors = true;
    }

    // Teléfono Principal
    const primaryPhone = form.complete_personal_data.primary_phone;
    if (!/^\d{4}-\d{4}$/.test(primaryPhone)) {
      setPrimaryPhoneError('Formato inválido. Use 9999-9999.');
      hasErrors = true;
    }

    // Teléfono Secundario (si está lleno)
    const secondaryPhone = form.complete_personal_data.secondary_phone;
    if (secondaryPhone && !/^\d{4}-\d{4}$/.test(secondaryPhone)) {
      setSecondaryPhoneError('Formato inválido. Use 9999-9999.');
      hasErrors = true;
    }

    // Cédula
    const cedula = form.complete_personal_data.cedula;
    if (!/^\d+$/.test(cedula) || cedula.length > 9 || cedula.length === 0) {
      setCedulaError(cedula.length === 0 ? 'Este campo es obligatorio.' :
        cedula.length > 9 ? 'Máximo 9 caracteres.' :
          'Solo se permiten números.');
      hasErrors = true;
    }

    // Lugar de nacimiento
    const birthPlace = form.complete_personal_data.birth_place;
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(birthPlace) || birthPlace.length > 40 || birthPlace.length === 0) {
      setBirthPlaceError(birthPlace.length === 0 ? 'Este campo es obligatorio.' :
        birthPlace.length > 40 ? 'Máximo 40 caracteres.' :
          'Solo se permiten letras y espacios.');
      hasErrors = true;
    }

    if (hasErrors) {
      console.log('❌ Validación fallida. No se envía el formulario.');
      return;
    }

    // Dirección de domicilio exacta
    const exactAddress = form.complete_personal_data.exact_address;
    if (exactAddress.length === 0) {
      setAddressError('Este campo es obligatorio.');
      hasErrors = true;
    } else if (exactAddress.length > 150) {
      setAddressError('Máximo 150 caracteres.');
      hasErrors = true;
    }


    // Validar Información Familiar (solo si se está mostrando)
    let hasFamilyErrors = false;

    if (showParents) {
      // Madre
      const mCed = form.family_information.mother_cedula;
      if (mCed && (mCed.length !== 9 || !/^\d+$/.test(mCed))) {
        setMotherCedulaError('La cédula debe tener 9 dígitos numéricos.');
        hasFamilyErrors = true;
      }

      const mName = form.family_information.mother_name;
      if (mName && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(mName) || mName.length < 5 || mName.length > 30)) {
        setMotherNameError(
          mName.length < 5 ? 'Mínimo 5 caracteres.' :
            mName.length > 30 ? 'Máximo 30 caracteres.' :
              'Solo letras y espacios.'
        );
        hasFamilyErrors = true;
      }

      const mOcc = form.family_information.mother_occupation;
      if (mOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(mOcc) || mOcc.length > 20)) {
        setMotherOccupationError('Máximo 20 caracteres, solo letras.');
        hasFamilyErrors = true;
      }

      const mPhone = form.family_information.mother_phone;
      if (mPhone && !/^\d{4}-\d{4}$/.test(mPhone)) {
        setMotherPhoneError('Formato inválido. Use 9999-9999.');
        hasFamilyErrors = true;
      }

      // Padre
      const fCed = form.family_information.father_cedula;
      if (fCed && (fCed.length !== 9 || !/^\d+$/.test(fCed))) {
        setFatherCedulaError('La cédula debe tener 9 dígitos numéricos.');
        hasFamilyErrors = true;
      }

      const fName = form.family_information.father_name;
      if (fName && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(fName) || fName.length < 5 || fName.length > 30)) {
        setFatherNameError(
          fName.length < 5 ? 'Mínimo 5 caracteres.' :
            fName.length > 30 ? 'Máximo 30 caracteres.' :
              'Solo letras y espacios.'
        );
        hasFamilyErrors = true;
      }

      const fOcc = form.family_information.father_occupation;
      if (fOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(fOcc) || fOcc.length > 20)) {
        setFatherOccupationError('Máximo 20 caracteres, solo letras.');
        hasFamilyErrors = true;
      }

      const fPhone = form.family_information.father_phone;
      if (fPhone && !/^\d{4}-\d{4}$/.test(fPhone)) {
        setFatherPhoneError('Formato inválido. Use 9999-9999.');
        hasFamilyErrors = true;
      }
    }

    if (hasFamilyErrors) {
      console.log('❌ Validación familiar fallida');
      return;
    }

    // Nombre del Encargado Legal
    const responsibleName = form.family_information.responsible_person;
    if (showLegalGuardian && responsibleName && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(responsibleName) || responsibleName.length < 5 || responsibleName.length > 30)) {
      setResponsibleNameError(
        responsibleName.length < 5 ? 'Mínimo 5 caracteres.' :
          responsibleName.length > 30 ? 'Máximo 30 caracteres.' :
            'Solo se permiten letras y espacios.'
      );
      hasErrors = true;
    }
    // Cédula del Encargado Legal
    if (showLegalGuardian) {
      const rCed = (form.family_information as FamilyInformation & { responsible_cedula?: string }).responsible_cedula;
      if (rCed && (rCed.length !== 9 || !/^\d+$/.test(rCed))) {
        setResponsibleCedulaError('La cédula debe tener 9 dígitos numéricos.');
        hasErrors = true;
      }
    }

    const fOcc = form.family_information.responsible_occupation;
    if (fOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(fOcc) || fOcc.length > 20)) {
      setResponsibleOccupationError('Máximo 20 caracteres, solo letras.');
      hasErrors = true;
    }

    // Teléfono del Encargado Legal
    const rPhone = form.family_information.responsible_phone;
    if (rPhone && !/^\d{4}-\d{4}$/.test(rPhone)) {
      setResponsiblePhoneError('Formato inválido. Use 9999-9999.');
      hasErrors = true;
    }

    // Convertir archivos específicos a array con sus tipos
    const specificDocuments = Object.entries(documentFiles)
      .filter(([, file]) => file !== null)
      .map(([type, file]) => ({
        type,
        file: file as File
      }));

    // Enfermedades que Padece
    const diseases = form.disability_information.medical_additional.diseases;
    if (diseases && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-[\]{}"'/_]*$/.test(diseases) || diseases.length > 200)) {
      setDiseasesError(
        diseases.length > 200 ? 'Máximo 200 caracteres.' :
          'No se permiten números.'
      );
      hasErrors = true;
    }

    // Observaciones Generales
    const generalObs = form.documentation_requirements.general_observations;
    if (generalObs && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-]*$/.test(generalObs) || generalObs.length > 200)) {
      setGeneralObservationsError(
        generalObs.length > 200 ? 'Máximo 200 caracteres.' : 'No se permiten números.'
      );
      hasErrors = true;
    }

    // Combinar todos los documentos
    const allDocuments = [...specificDocuments];

    console.log('All documents to upload:', allDocuments);

    // In modification mode, if no new documents are uploaded but existing documents are marked as 'entregado',
    // we should still allow the form submission
    if (isModification && allDocuments.length === 0) {
      const hasExistingDocuments = form.documentation_requirements.documents.some(doc => doc.status === 'entregado');
      console.log('Has existing documents:', hasExistingDocuments);
      console.log('Document statuses:', form.documentation_requirements.documents.map(doc => ({
        type: doc.document_type,
        status: doc.status
      })));

      if (hasExistingDocuments) {
        console.log('Modification mode with existing documents - allowing submission without new files');
      } else {
        console.log('No existing documents and no new files - this might be an issue');
        // Don't prevent submission in modification mode - let the backend handle it
        console.log('Allowing submission anyway in modification mode');
      }
    }

    const formData: Phase3Data = {
      ...form,
      documents: allDocuments.map(doc => doc.file) // Keep the original format for now
    };

    // Store document types for API service
    (formData as Phase3Data & { documentTypes: { [key: string]: string } }).documentTypes = allDocuments.reduce((acc, doc) => {
      acc[doc.file.name] = doc.type;
      return acc;
    }, {} as { [key: string]: string });

    console.log('Final form data:', formData);
    console.log('Calling onSubmit with form data...');
    onSubmit(formData);
    console.log('onSubmit called successfully');
  };

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden box-border bg-white rounded-lg shadow-sm p-4 sm:p-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
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

      {/* Step progress: carousel (3 steps visible) to avoid overflow */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setStepperViewStart(s => Math.max(0, s - 1))}
            disabled={stepperViewStart === 0}
            className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
            aria-label="Ver pasos anteriores"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-1 items-center justify-center gap-1 min-w-0">
            {Array.from({ length: STEPS_VISIBLE }, (_, i) => {
              const index = stepperViewStart + i;
              if (index >= TOTAL_STEPS) return null;
              const label = STEP_LABELS[index];
              const isCurrent = index === currentStep;
              const isPast = index < currentStep;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`flex flex-col items-center flex-1 min-w-0 max-w-[100px] min-h-[44px] py-2 px-1 rounded-lg transition-colors touch-manipulation ${
                    isCurrent
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-2'
                      : isPast
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                        : 'text-gray-400 cursor-default'
                  }`}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold flex-shrink-0 ${
                    isCurrent ? 'bg-blue-600 text-white' : isPast ? 'bg-gray-300 text-gray-700' : 'bg-gray-200 text-gray-500'
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
            onClick={() => setStepperViewStart(s => Math.min(TOTAL_STEPS - STEPS_VISIBLE, s + 1))}
            disabled={stepperViewStart >= TOTAL_STEPS - STEPS_VISIBLE}
            className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none touch-manipulation"
            aria-label="Ver siguientes pasos"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Paso {currentStep + 1} de {TOTAL_STEPS}: {STEP_LABELS[currentStep]}
        </p>
      </div>

      <form onSubmit={(e) => {
        console.log('=== FORM ONSUBMIT EVENT TRIGGERED ===');
        console.log('Event:', e);
        handleSubmit(e);
      }} className="min-w-0 w-full max-w-full overflow-x-hidden box-border break-words space-y-6 sm:space-y-8 [&_input]:text-base [&_select]:text-base [&_textarea]:text-base">
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
            {/* ✅ Nombre Completo con validación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
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
              />
              <p className="text-xs text-gray-500 mt-1">
                {fullNameCharsLeft} caracteres restantes (mínimo 5, máximo 40)
              </p>
              {fullNameError && <p className="text-xs text-red-500 mt-1">{fullNameError}</p>}
            </div>
            {/* ✅ Número de Cédula con validación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cédula *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.cedula}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const isValid = /^\d*$/.test(rawValue); // Solo dígitos o vacío
                  const isLengthValid = rawValue.length <= 9;

                  if (!isValid) {
                    setCedulaError('Solo se permiten números.');
                    // No actualizamos el formulario
                    return;
                  }

                  if (!isLengthValid) {
                    setCedulaError('Máximo 9 caracteres.');
                    return;
                  }

                  // Si todo es válido, limpiamos el error y actualizamos
                  setCedulaError('');
                  handleChange('complete_personal_data', 'cedula', rawValue);
                  setCedulaCharsLeft(9 - rawValue.length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${cedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {cedulaCharsLeft} caracteres restantes (máximo 9)
              </p>
              {cedulaError && <p className="text-xs text-red-500 mt-1">{cedulaError}</p>}
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
            {/* ✅ Lugar de Nacimiento con validación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lugar de Nacimiento *
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
              />
              <p className="text-xs text-gray-500 mt-1">
                {birthPlaceCharsLeft} caracteres restantes (máximo 40)
              </p>
              {birthPlaceError && <p className="text-xs text-red-500 mt-1">{birthPlaceError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Principal *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.primary_phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                  let formatted = digits;
                  if (digits.length > 4) {
                    formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                  }
                  if (formatted.length > 9) return;

                  setPrimaryPhoneError('');
                  handleChange('complete_personal_data', 'primary_phone', formatted);
                  setPrimaryPhoneCharsLeft(9 - formatted.length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${primaryPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
                placeholder="Ej: 8888-8888"
              />
              <p className="text-xs text-gray-500 mt-1">
                {primaryPhoneCharsLeft} caracteres restantes (máximo 9, formato: 9999-9999)
              </p>
              {primaryPhoneError && <p className="text-xs text-red-500 mt-1">{primaryPhoneError}</p>}
            </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono Secundario *
              </label>
              <input
                type="text"
                value={form.complete_personal_data.secondary_phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                  let formatted = digits;
                  if (digits.length > 4) {
                    formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                  }
                  if (formatted.length > 9) return;

                  setSecondaryPhoneError('');
                  handleChange('complete_personal_data', 'secondary_phone', formatted);
                  setSecondaryPhoneCharsLeft(9 - formatted.length);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${secondaryPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                required
                placeholder="Ej: 8888-8888"
              />
              <p className="text-xs text-gray-500 mt-1">
                {secondaryPhoneCharsLeft} caracteres restantes (máximo 9, formato: 9999-9999)
              </p>
              {secondaryPhoneError && <p className="text-xs text-red-500 mt-1">{secondaryPhoneError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={form.complete_personal_data.email}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  complete_personal_data: {
                    ...prev.complete_personal_data,
                    email: e.target.value
                  }
                }))}
                readOnly={!isAdminCreation && !isAdminEdit}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-md ${!isAdminCreation && !isAdminEdit
                  ? 'bg-gray-50 cursor-not-allowed'
                  : 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder={isAdminCreation || isAdminEdit ? "Ingrese el correo electrónico" : "Obtenido de su cuenta de usuario"}
              />
              <p className="text-xs text-gray-500 mt-1">
                {isAdminCreation || isAdminEdit
                  ? "Correo electrónico de la persona"
                  : "Obtenido automáticamente de su cuenta"
                }
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de domicilio exacta *
            </label>
            <textarea
              value={form.complete_personal_data.exact_address}
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
            />
            <p className="text-xs text-gray-500 mt-1">
              {addressCharsLeft} caracteres restantes (máximo 150)
            </p>
            {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
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
                Cantón *
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
                Distrito *
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">Información Familiar, al menos uno es requerido</h3>
              {needsModification('family_information') && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Requiere Modificación
                </span>
              )}
            </div>

            {/* Toggle between Parents and Legal Guardian (mobile: larger touch targets) */}
            <div className="flex bg-gray-100 rounded-lg p-1">
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

          {/* Información de la Madre - Only show when parents mode is selected */}
          {showParents && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Información de la Madre</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Madre
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
                    placeholder='Opcional'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {motherNameCharsLeft} caracteres restantes (mín. 5, máx. 40)
                  </p>
                  {motherNameError && <p className="text-xs text-red-500 mt-1">{motherNameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cédula Madre
                  </label>
                  <input
                    type="text"
                    value={form.family_information.mother_cedula}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length > 9) return;

                      if (value.length > 9) {
                        setMotherCedulaError('Máximo 9 caracteres.');
                        return;
                      }

                      setMotherCedulaError('');
                      handleChange('family_information', 'mother_cedula', value);
                      setMotherCedulaCharsLeft(9 - value.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder='Opcional'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {motherCedulaCharsLeft} caracteres restantes (máx. 9)
                  </p>
                  {motherCedulaError && <p className="text-xs text-red-500 mt-1">{motherCedulaError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupación de la Madre
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
                    placeholder='Opcional'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {motherOccupationCharsLeft} caracteres restantes (máx. 40)
                  </p>
                  {motherOccupationError && <p className="text-xs text-red-500 mt-1">{motherOccupationError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de la Madre
                  </label>
                  <input
                    type="text"
                    value={form.family_information.mother_phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      let formatted = digits;
                      if (digits.length > 4) {
                        formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                      }
                      if (formatted.length > 9) return;

                      setMotherPhoneError('');
                      handleChange('family_information', 'mother_phone', formatted);
                      setMotherPhoneCharsLeft(9 - formatted.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder='Ej: 8888-8888'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {motherPhoneCharsLeft} caracteres restantes (máx. 9, formato: 9999-9999)
                  </p>
                  {motherPhoneError && <p className="text-xs text-red-500 mt-1">{motherPhoneError}</p>}
                </div>
              </div>
            </div>
          )}


          {/* Información del Padre - Only show when parents mode is selected */}
          {showParents && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Información del Padre</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Padre
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
                    placeholder='Opcional'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fatherNameCharsLeft} caracteres restantes (mín. 5, máx. 40)
                  </p>
                  {fatherNameError && <p className="text-xs text-red-500 mt-1">{fatherNameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cédula Padre
                  </label>
                  <input
                    type="text"
                    value={form.family_information.father_cedula}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length > 9) return;

                      if (value.length > 9) {
                        setFatherCedulaError('Máximo 9 caracteres.');
                        return;
                      }

                      setFatherCedulaError('');
                      handleChange('family_information', 'father_cedula', value);
                      setFatherCedulaCharsLeft(9 - value.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder='Opcional'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fatherCedulaCharsLeft} caracteres restantes (máx. 9)
                  </p>
                  {fatherCedulaError && <p className="text-xs text-red-500 mt-1">{fatherCedulaError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupación del Padre
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
                    placeholder='Opcional'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fatherOccupationCharsLeft} caracteres restantes (máx. 40)
                  </p>
                  {fatherOccupationError && <p className="text-xs text-red-500 mt-1">{fatherOccupationError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Padre
                  </label>
                  <input
                    type="text"
                    value={form.family_information.father_phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      let formatted = digits;
                      if (digits.length > 4) {
                        formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                      }
                      if (formatted.length > 9) return;

                      setFatherPhoneError('');
                      handleChange('family_information', 'father_phone', formatted);
                      setFatherPhoneCharsLeft(9 - formatted.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherPhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder='Ej: 8888-8888'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fatherPhoneCharsLeft} caracteres restantes (máx. 9, formato: 9999-9999)
                  </p>
                  {fatherPhoneError && <p className="text-xs text-red-500 mt-1">{fatherPhoneError}</p>}
                </div>
              </div>
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
                    Nombre del Encargado Legal
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
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {responsibleNameCharsLeft} caracteres restantes (máximo. 40)
                  </p>
                  {responsibleNameError && <p className="text-xs text-red-500 mt-1">{responsibleNameError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero de cedula del encargado Legal
                  </label>
                  <input
                    type="text"
                    value={(form.family_information as FamilyInformation & { responsible_cedula?: string }).responsible_cedula ?? ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número
                      if (value.length > 9) return; // Bloquea si ya tiene 9 dígitos

                      if (value.length > 0 && value.length < 9) {
                        setResponsibleCedulaError('Debe tener 9 dígitos.');
                      } else if (value.length > 9) {
                        setResponsibleCedulaError('Máximo 9 caracteres.');
                      } else {
                        setResponsibleCedulaError('');
                      }

                      handleChange('family_information', 'responsible_cedula', value);
                      setResponsibleCedulaCharsLeft(9 - value.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsibleCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {responsibleCedulaCharsLeft} caracteres restantes (máximo 9)
                  </p>
                  {responsibleCedulaError && <p className="text-xs text-red-500 mt-1">{responsibleCedulaError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupación del Encargado Legal
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
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {responsibleOccupationCharsLeft} caracteres restantes (máximo 40)
                  </p>
                  {responsibleOccupationError && <p className="text-xs text-red-500 mt-1">{responsibleOccupationError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Encargado Legal
                  </label>
                  <input
                    type="text"
                    value={form.family_information.responsible_phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                      let formatted = digits;
                      if (digits.length > 4) {
                        formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                      }
                      if (formatted.length > 9) return;

                      setResponsiblePhoneError('');
                      handleChange('family_information', 'responsible_phone', formatted);
                      setResponsiblePhoneCharsLeft(9 - formatted.length);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsiblePhoneError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {responsiblePhoneCharsLeft} caracteres restantes (máximo 9, formato: 9999-9999)
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
        <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Información de Discapacidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <p className="text-sm text-gray-600">
                  El dictamen médico debe ser subido como documento en la sección de "Documentos Requeridos".
                </p>
              </div>
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
                <option value="rnc">RnC (Regimen no contributivo)</option>
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

        {/* Información Médica Adicional */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Información Médica Adicional</h3>
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
                  value={form.disability_information.medical_additional.blood_type}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    disability_information: {
                      ...prev.disability_information,
                      medical_additional: {
                        ...prev.disability_information.medical_additional,
                        blood_type: e.target.value as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione tipo de sangre</option>
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
                  value={form.disability_information.medical_additional.diseases}
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
        </>
        )}

        {currentStep === 4 && (
        <>
        {/* Subida de Documentos - compact on mobile */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Documentos Requeridos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
            {documentTypes.map((doc) => {
              const documentStatus = form.documentation_requirements.documents.find(d => d.document_type === doc.key)?.status || 'pendiente';
              const hasFile = documentFiles[doc.key];

              return (
                <div key={doc.key} className={`border rounded-lg p-2.5 sm:p-4 ${documentStatus === 'entregado' ? 'border-green-200 bg-green-50' :
                  documentStatus === 'en_tramite' ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200'
                }`}>
                  {/* Mobile: compact one-line row + optional filename */}
                  <div className="flex sm:hidden flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-700 truncate min-w-0 flex-1">{doc.label}{doc.required ? ' *' : ''}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full flex-shrink-0 ${documentStatus === 'entregado' ? 'bg-green-100 text-green-800' : documentStatus === 'en_tramite' ? 'bg-yellow-100 text-yellow-800' : documentStatus === 'no_aplica' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                        {documentStatus === 'entregado' ? 'OK' : documentStatus === 'en_tramite' ? 'Trámite' : documentStatus === 'no_aplica' ? 'N/A' : 'Pend.'}
                      </span>
                      <button type="button" onClick={() => fileInputRefs.current[doc.key]?.click()} className="flex-shrink-0 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded min-h-[36px] touch-manipulation">
                        Elegir archivo
                      </button>
                      {hasFile && (
                        <button type="button" onClick={() => handleDocumentChange(doc.key, null)} className="text-red-500 p-1 -m-1 touch-manipulation" aria-label="Quitar">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {documentStatus === 'entregado' && !hasFile && (
                      <div className="flex items-center gap-1.5 text-[10px] text-green-700">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        <span>Ya subido</span>
                      </div>
                    )}
                    {hasFile && (
                      <p className="text-[10px] text-green-600 truncate pl-0.5">{documentFiles[doc.key]?.name}</p>
                    )}
                  </div>
                  {/* Desktop: full card */}
                  <div className="hidden sm:block">
                    {documentStatus === 'entregado' && !hasFile && (
                      <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Documento ya subido anteriormente</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">{doc.label} {doc.required && <span className="text-red-500">*</span>}</label>
                        <span className={`px-2 py-1 text-xs rounded-full ${documentStatus === 'entregado' ? 'bg-green-100 text-green-800' : documentStatus === 'en_tramite' ? 'bg-yellow-100 text-yellow-800' : documentStatus === 'no_aplica' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                          {documentStatus === 'entregado' ? 'Entregado' : documentStatus === 'en_tramite' ? 'En trámite' : documentStatus === 'no_aplica' ? 'No aplica' : 'Pendiente'}
                        </span>
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
        </div>

        </>
        )}

        {currentStep === 5 && (
        <>
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

          {/* Lista de documentos requeridos */}
          <h4 className="font-medium text-gray-900 mb-3">Documentos Requeridos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            {[
              { key: 'dictamen_medico', label: 'Dictamen Médico', required: true },
              { key: 'constancia_nacimiento', label: 'Constancia de Nacimiento', required: true },
              { key: 'copia_cedula', label: 'Copia de Cédula (solicitante)', required: true },
              { key: 'copias_cedulas_familia', label: 'Copias de Cédulas (familia)', required: true },
              { key: 'foto_pasaporte', label: 'Foto Tamaño Pasaporte', required: true },
              { key: 'constancia_pension_ccss', label: 'Constancia de Pensión CCSS', required: false },
              { key: 'constancia_pension_alimentaria', label: 'Constancia de Pensión Alimentaria', required: false },
              { key: 'constancia_estudio', label: 'Constancia de Estudio (En caso de solicitante este en estudio)', required: false },
              { key: 'cuenta_banco_nacional', label: 'Cuenta Banco Nacional', required: false }
            ].map((req) => (
              <div key={req.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-2.5 sm:p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${req.required ? 'bg-red-500' : 'bg-gray-400'}`} aria-hidden />
                  <label className="text-xs sm:text-sm text-gray-700 truncate" title={req.label}>
                    {req.label} {req.required && <span className="text-red-500">*</span>}
                  </label>
                </div>
                <select
                  className="text-xs sm:text-sm border border-gray-300 rounded px-2 py-1.5 sm:px-3 sm:py-1 bg-white w-full sm:w-auto sm:min-w-[100px] flex-shrink-0 min-h-[40px] touch-manipulation"
                  onChange={(e) => {
                    const status = e.target.value as 'entregado' | 'pendiente' | 'en_tramite' | 'no_aplica';
                    const existingDoc = form.documentation_requirements.documents.find(doc => doc.document_type === req.key);

                    if (existingDoc) {
                      const updatedDocs = form.documentation_requirements.documents.map(doc =>
                        doc.document_type === req.key ? { ...doc, status } : doc
                      );
                      handleChange('documentation_requirements', 'documents', updatedDocs);
                    } else {
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
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir letras, espacios, signos de puntuación básicos (sin números)
                const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ.,;:¿?¡!()-]*$/.test(value);
                const length = value.length;

                if (!isValid) {
                  setGeneralObservationsError('No se permiten números.');
                  return;
                }

                if (length > 200) {
                  setGeneralObservationsError('Máximo 200 caracteres.');
                  return;
                }

                setGeneralObservationsError('');
                handleChange('documentation_requirements', 'general_observations', value);
                setGeneralObservationsCharsLeft(200 - length);
              }}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${generalObservationsError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              placeholder="Opcional"
            />
            <p className="text-xs text-gray-500 mt-1">
              {generalObservationsCharsLeft} caracteres restantes (máximo 200)
            </p>
            {generalObservationsError && <p className="text-xs text-red-500 mt-1">{generalObservationsError}</p>}
          </div>
        </div>
        </>
        )}

        {/* Spacer so last step content isn't hidden behind sticky nav on mobile */}
        <div className="h-20 sm:h-0" aria-hidden />

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
