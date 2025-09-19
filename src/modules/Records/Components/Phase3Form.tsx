import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Upload, X, Plus, Trash2, CheckCircle } from 'lucide-react';
import type { Phase3Data, RecordWithDetails, RequiredDocument, AvailableService } from '../Types/records';
import { useAuth } from '../../Login/Hooks/useAuth';
import { getProvinces, getCantonsByProvince, getDistrictsByCanton, type Province, type Canton, type District } from '../Services/geographicApi';

interface Phase3FormProps {
  onSubmit: (data: Phase3Data) => void;
  loading: boolean;
  currentRecord: RecordWithDetails;
  uploadProgress?: number;
  isModification?: boolean;
  modificationDetails?: {
    sections: string[];
    documents: number[];
    comment: string;
  } | null;
}

const Phase3Form: React.FC<Phase3FormProps> = ({ 
  onSubmit, 
  loading, 
  currentRecord,
  uploadProgress = 0,
  isModification = false,
  modificationDetails = null
}) => {
  const { user } = useAuth();
  
  // Geographic data state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

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
  const [form, setForm] = useState<Phase3Data>({
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
      responsible_cedula: '',
      responsible_address: '',
      responsible_occupation: '',
      responsible_phone: '',
      family_members: []
    },
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
  const [genericDocuments, setGenericDocuments] = useState<File[]>([]);
  const [documentAssignments, setDocumentAssignments] = useState<{ [key: string]: string }>({});

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
  }, [isModification, currentRecord]);

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
          // Pre-fill email from user account
          email: user?.email || '',
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
  }, [currentRecord, user, isModification]);

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
        if (doc.document_type === 'payment_info') {
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

  const handleGenericDocumentUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setGenericDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const handleDocumentAssignment = (fileName: string, documentType: string) => {
    setDocumentAssignments(prev => ({
      ...prev,
      [fileName]: documentType
    }));
  };

  const removeGenericDocument = (fileName: string) => {
    setGenericDocuments(prev => prev.filter(file => file.name !== fileName));
    setDocumentAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[fileName];
      return newAssignments;
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    console.log('=== FORM SUBMISSION HANDLER CALLED ===');
    console.log('Event:', e);
    console.log('Event type:', e.type);
    console.log('Event target:', e.target);
    console.log('Event currentTarget:', e.currentTarget);
    
    e.preventDefault();
    console.log('Event:', e);
    console.log('Is modification:', isModification);
    console.log('Document files:', documentFiles);
    console.log('Form documents:', form.documentation_requirements.documents);
    console.log('Loading state:', loading);
    console.log('Form state:', form);
    
    // Convertir archivos específicos a array con sus tipos
    const specificDocuments = Object.entries(documentFiles)
      .filter(([, file]) => file !== null)
      .map(([type, file]) => ({
        type,
        file: file as File
      }));
    
    // Procesar documentos genéricos asignados
    const assignedGenericDocuments = genericDocuments
      .filter(file => documentAssignments[file.name])
      .map(file => {
        const assignedType = documentAssignments[file.name];
        const newFileName = `${assignedType}_${file.name}`;
        return {
          type: assignedType,
          file: new File([file], newFileName, { type: file.type })
        };
      });
    
    // Combinar todos los documentos
    const allDocuments = [...specificDocuments, ...assignedGenericDocuments];
    
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isModification ? 'Actualización de Expediente - Fase 3' : 'Formulario Completo - Fase 3'}
          </h2>
          <p className="text-gray-600">
            {isModification 
              ? 'Actualice la información según las modificaciones solicitadas por el administrador'
              : 'Complete toda la información requerida para su expediente'
            }
          </p>
        </div>
      </div>

      <form onSubmit={(e) => {
        console.log('=== FORM ONSUBMIT EVENT TRIGGERED ===');
        console.log('Event:', e);
        handleSubmit(e);
      }} className="space-y-8">
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
        {/* Datos Personales Completos */}
        <div className={`border rounded-lg p-6 ${
          needsModification('complete_personal_data') 
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
                Teléfono Principal *
              </label>
              <input
                type="tel"
                value={form.complete_personal_data.primary_phone}
                onChange={(e) => handleChange('complete_personal_data', 'primary_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Pre-cargado desde Fase 1"
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
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={form.complete_personal_data.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                placeholder="Obtenido de su cuenta de usuario"
              />
              <p className="text-xs text-gray-500 mt-1">Obtenido automáticamente de su cuenta</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de domicilio exacta 
            </label>
            <textarea
              value={form.complete_personal_data.exact_address}
              onChange={(e) => handleChange('complete_personal_data', 'exact_address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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

        {/* Información Familiar */}
        <div className={`border rounded-lg p-6 ${
          needsModification('family_information') 
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
            
            {/* Toggle between Parents and Legal Guardian */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => handleFamilyModeToggle('parents')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showParents 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Información de Padres
              </button>
              <button
                type="button"
                onClick={() => handleFamilyModeToggle('guardian')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showLegalGuardian 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
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
                  onChange={(e) => handleChange('family_information', 'mother_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cédula Madre
                </label>
                <input
                  type="text"
                  value={form.family_information.mother_cedula}
                  onChange={(e) => handleChange('family_information', 'mother_cedula', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupación de la Madre
                </label>
                <input
                  type="text"
                  value={form.family_information.mother_occupation}
                  onChange={(e) => handleChange('family_information', 'mother_occupation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de la Madre
                </label>
                <input
                  type="tel"
                  value={form.family_information.mother_phone}
                  onChange={(e) => handleChange('family_information', 'mother_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
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
                  onChange={(e) => handleChange('family_information', 'father_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cédula Padre
                </label>
                <input
                  type="text"
                  value={form.family_information.father_cedula}
                  onChange={(e) => handleChange('family_information', 'father_cedula', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupación del Padre
                </label>
                <input
                  type="text"
                  value={form.family_information.father_occupation}
                  onChange={(e) => handleChange('family_information', 'father_occupation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del Padre
                </label>
                <input
                  type="tel"
                  value={form.family_information.father_phone}
                  onChange={(e) => handleChange('family_information', 'father_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='Opcional'
                />
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
                  onChange={(e) => handleChange('family_information', 'responsible_person', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero de cedula del encargado Legal
                </label>
                <input
                  type="text"
                  value={form.family_information.responsible_cedula}
                  onChange={(e) => handleChange('family_information', 'responsible_cedula', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupación del Encargado Legal
                </label>
                <input
                  type="text"
                  value={form.family_information.responsible_occupation}
                  onChange={(e) => handleChange('family_information', 'responsible_occupation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del Encargado Legal
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
          )}
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
        <div className="border border-gray-200 rounded-lg p-6 ">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Información Médica Adicional</h3>
              <p className="text-sm text-gray-600">Complete la información médica relevante del beneficiario</p>
            </div>
          </div>

          {/* Información Básica Médica */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    disability_information: {
                      ...prev.disability_information,
                      medical_additional: {
                        ...prev.disability_information.medical_additional,
                        diseases: e.target.value
                      }
                    }
                  }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Describa las enfermedades que padece el beneficiario (Opcional)"
                />
              </div>
            </div>
          </div>
          
          {/* Beneficios Biomecánicos */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              Beneficios Biomecánicos
            </h4>
            <p className="text-sm text-gray-600 mb-4">Seleccione los dispositivos de asistencia que utiliza el beneficiario</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                <label key={benefit.key} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  form.disability_information.medical_additional.biomechanical_benefit.some(b => b.type === benefit.key)
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
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              Limitaciones Permanentes
            </h4>
            <p className="text-sm text-gray-600 mb-4">Indique si Presenta limitaciones permanentes y su grado de severidad (Opcional)</p>
            <div className="space-y-4">
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
                <div key={limitation.key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{limitation.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
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
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                 {/* Subida de Documentos */}
         <div className="border border-gray-200 rounded-lg p-6">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos Requeridos</h3>
           <div className="space-y-4">
             {documentTypes.map((doc) => {
               const documentStatus = form.documentation_requirements.documents.find(d => d.document_type === doc.key)?.status || 'pendiente';
               const hasFile = documentFiles[doc.key];
               
               return (
                 <div key={doc.key} className={`border rounded-lg p-4 ${
                   documentStatus === 'entregado' ? 'border-green-200 bg-green-50' : 
                   documentStatus === 'en_tramite' ? 'border-yellow-200 bg-yellow-50' : 
                   'border-gray-200'
                 }`}>
                   {/* Show if document is already uploaded */}
                   {documentStatus === 'entregado' && !hasFile && (
                     <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800 flex items-center gap-2">
                       <CheckCircle className="w-4 h-4" />
                       <span>Documento ya subido anteriormente</span>
                     </div>
                   )}
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <label className="text-sm font-medium text-gray-700">
                         {doc.label} {doc.required && <span className="text-red-500">*</span>}
                       </label>
                       <span className={`px-2 py-1 text-xs rounded-full ${
                         documentStatus === 'entregado' ? 'bg-green-100 text-green-800' :
                         documentStatus === 'en_tramite' ? 'bg-yellow-100 text-yellow-800' :
                         documentStatus === 'no_aplica' ? 'bg-gray-100 text-gray-800' :
                         'bg-red-100 text-red-800'
                       }`}>
                         {documentStatus === 'entregado' ? 'Entregado' :
                          documentStatus === 'en_tramite' ? 'En trámite' :
                          documentStatus === 'no_aplica' ? 'No aplica' :
                          'Pendiente'}
                       </span>
                     </div>
                     {hasFile && (
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
                     required={doc.required && documentStatus !== 'entregado'}
                   />
                   {hasFile && (
                     <div className="mt-2 flex items-center gap-2">
                       <span className="text-xs text-green-600">✓</span>
                       <p className="text-xs text-green-600">
                         {documentFiles[doc.key]?.name}
                       </p>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
         </div>

         {/* Documentos Genéricos - Asignación Manual */}
         {genericDocuments.length > 0 && (
           <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
             <h3 className="text-lg font-medium text-orange-900 mb-4">
               📄 Documentos Pendientes de Asignación
             </h3>
             <p className="text-sm text-orange-800 mb-4">
               Los siguientes documentos han sido subidos pero necesitan ser asignados a un tipo específico:
             </p>
             <div className="space-y-3">
               {genericDocuments.map((file, index) => (
                 <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                   <div className="flex items-center gap-3">
                     <span className="text-sm font-medium text-gray-700">{file.name}</span>
                     <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <select
                       value={documentAssignments[file.name] || ''}
                       onChange={(e) => handleDocumentAssignment(file.name, e.target.value)}
                       className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                     >
                       <option value="">Seleccionar tipo...</option>
                       {documentTypes.map(doc => (
                         <option key={doc.key} value={doc.key}>
                           {doc.label}
                         </option>
                       ))}
                     </select>
                     <button
                       type="button"
                       onClick={() => removeGenericDocument(file.name)}
                       className="text-red-500 hover:text-red-700"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Subida de Documentos Genéricos */}
         <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
           <h3 className="text-lg font-medium text-blue-900 mb-4">
             📁 Subir Documentos Adicionales
           </h3>
           <p className="text-sm text-blue-800 mb-4">
             Si tiene documentos que no se encuentran en la lista de documentos requeridos, súbalos aquí.
           </p>
           <input
             type="file"
             multiple
             onChange={(e) => handleGenericDocumentUpload(e.target.files)}
             className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
             accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
           />
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
              Para completar su expediente, debe realizar el pago de la cuota de afiliación de <strong>500 colones</strong> en la siguiente cuenta de sinpe movil: 8888-8888.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Estado del Pago
                </label>
                <select
                  value={form.documentation_requirements.affiliation_fee_paid ? 'pagada' : 'pendiente'}
                  onChange={(e) => handleChange('documentation_requirements', 'affiliation_fee_paid', e.target.value === 'pagada')}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Información de Sinpe Movil
                </label>
                <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-md">
                  <strong>Nota:</strong> La información de pago se sube como un documento. 
                  Por favor, suba una captura de pantalla o comprobante del pago realizado en la sección de documentos requeridos.
                </p>
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
              { key: 'constancia_estudio', label: 'Constancia de Estudio (En caso de solicitante este en estudio)', required: false },
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
              placeholder="Opcional"
            />
          </div>
        </div>

           {/* Botón de envío */}
           <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              console.log('=== SUBMIT BUTTON CLICKED ===');
              console.log('Button disabled:', loading);
              console.log('Is modification:', isModification);
              console.log('Form state:', form);
              console.log('Document files:', documentFiles);
              console.log('Generic documents:', genericDocuments);
              console.log('Document assignments:', documentAssignments);
              console.log('Form documents status:', form.documentation_requirements.documents);
              
              if (loading) {
                console.log('Button is disabled due to loading state');
                e.preventDefault();
                return;
              }
              
              console.log('Proceeding with form submission...');
              // Let the form's onSubmit handler handle the submission
            }}
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
                {isModification ? 'Actualizar Expediente' : 'Completar Expediente'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>

    
  );
};

export default Phase3Form;
