import React, { useState, useEffect, useMemo } from 'react';
import { User, X, Eye, EyeOff } from 'lucide-react';
import { checkCedulaAvailability } from '../Services/recordsApi';
import { getProvinces, getCantonsByProvince, getDistrictsByCanton, type Province, type Canton, type District } from '../Services/geographicApi';
import {
  DISABILITY_TYPE_OPTIONS,
  normalizeDisabilityTypes,
  type Phase1Data,
  type RecordWithDetails,
  type DisabilityTypeOption
} from '../Types/records';

interface Phase1FormProps {
  onSubmit: (data: Phase1Data) => void;
  loading: boolean;
  currentRecord?: RecordWithDetails;
  onBackToIntro?: () => void;
  isModification?: boolean;
}

const Phase1Form: React.FC<Phase1FormProps> = ({
  onSubmit,
  loading,
  currentRecord,
  onBackToIntro,
  isModification = false
}) => {
  const [form, setForm] = useState<Omit<Phase1Data, 'pcd_name'> & { pcd_name: string }>({
    full_name: '',
    pcd_name: '',
    cedula: '',
    gender: 'male',
    birth_date: '',
    birth_place: '',
    address: '',
    province: '',
    canton: '',
    district: '',
    phone: '',
    mother_name: '',
    mother_cedula: '',
    mother_phone: '',
    father_name: '',
    father_cedula: '',
    father_phone: '',
    legal_guardian_name: '',
    legal_guardian_cedula: '',
    legal_guardian_phone: '',
    mother_occupation: '',
    father_occupation: '',
    legal_guardian_occupation: ''
  });
  const [cedulaAvailable, setCedulaAvailable] = useState<boolean | null>(null);
  const [cedulaChecking, setCedulaChecking] = useState(false);

  const birthDateLimits = useMemo(() => {
    const today = new Date();
    const max = today.toISOString().slice(0, 10);
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 120);
    const min = minDate.toISOString().slice(0, 10);
    return { min, max };
  }, []);

  // Validation states
  const [fullNameError, setFullNameError] = useState("");
  const [fullNameCharsLeft, setFullNameCharsLeft] = useState(40);

  const [cedulaError, setCedulaError] = useState("");
  const [cedulaCharsLeft, setCedulaCharsLeft] = useState(13);

  const [phoneError, setPhoneError] = useState("");
  const [phoneCharsLeft, setPhoneCharsLeft] = useState(8);

  const [birthPlaceError, setBirthPlaceError] = useState("");
  const [birthPlaceCharsLeft, setBirthPlaceCharsLeft] = useState(40);

  const [addressError, setAddressError] = useState("");
  const [addressCharsLeft, setAddressCharsLeft] = useState(150);

  const [birthDateError, setBirthDateError] = useState('');
  const [locationStepError, setLocationStepError] = useState('');
  const [familyBlockError, setFamilyBlockError] = useState('');
  const [pcdNameError, setPcdNameError] = useState('');
  const [phase1DisabilityTypes, setPhase1DisabilityTypes] = useState<DisabilityTypeOption[]>([]);
  const [showDisabilityTypeAddMore, setShowDisabilityTypeAddMore] = useState(false);
  const [disabilityTypeAddMore, setDisabilityTypeAddMore] = useState('');

  const disabilityTypesCount = phase1DisabilityTypes.length;

  const applyPhase1DisabilityTypes = (next: DisabilityTypeOption[]) => {
    setPhase1DisabilityTypes(next);
    setForm((prev) => ({ ...prev, pcd_name: next.join(',') }));
  };

  // Validaciones para Información Familiar
  const [motherNameError, setMotherNameError] = useState('');
  const [motherNameCharsLeft, setMotherNameCharsLeft] = useState(40);
  const [motherCedulaError, setMotherCedulaError] = useState('');
  const [motherCedulaCharsLeft, setMotherCedulaCharsLeft] = useState(13);
  const [motherPhoneError, setMotherPhoneError] = useState('');
  const [motherPhoneCharsLeft, setMotherPhoneCharsLeft] = useState(8);
  const [motherOccupationError, setMotherOccupationError] = useState('');
  const [motherOccupationCharsLeft, setMotherOccupationCharsLeft] = useState(40);

  const [fatherNameError, setFatherNameError] = useState('');
  const [fatherNameCharsLeft, setFatherNameCharsLeft] = useState(40);
  const [fatherCedulaError, setFatherCedulaError] = useState('');
  const [fatherCedulaCharsLeft, setFatherCedulaCharsLeft] = useState(13);
  const [fatherPhoneError, setFatherPhoneError] = useState('');
  const [fatherPhoneCharsLeft, setFatherPhoneCharsLeft] = useState(8);
  const [fatherOccupationError, setFatherOccupationError] = useState('');
  const [fatherOccupationCharsLeft, setFatherOccupationCharsLeft] = useState(40);

  const [responsibleNameError, setResponsibleNameError] = useState('');
  const [responsibleNameCharsLeft, setResponsibleNameCharsLeft] = useState(40);
  const [responsibleCedulaError, setResponsibleCedulaError] = useState('');
  const [responsibleCedulaCharsLeft, setResponsibleCedulaCharsLeft] = useState(13);
  const [responsiblePhoneError, setResponsiblePhoneError] = useState('');
  const [responsiblePhoneCharsLeft, setResponsiblePhoneCharsLeft] = useState(8);
  const [responsibleOccupationError, setResponsibleOccupationError] = useState('');
  const [responsibleOccupationCharsLeft, setResponsibleOccupationCharsLeft] = useState(40);

  // Geographic data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Parent/guardian visibility (misma lógica que Phase3Form; los datos no se borran al cambiar pestaña)
  const [showParents, setShowParents] = useState(true);
  const [showLegalGuardian, setShowLegalGuardian] = useState(false);
  const [motherSectionOpen, setMotherSectionOpen] = useState(true);
  const [fatherSectionOpen, setFatherSectionOpen] = useState(true);

  /** Al menos un padre/madre (nombre válido) o encargado legal (nombre válido). */
  const familyPathCompletion = useMemo(() => {
    const isDisplayNameValid = (s: string) => {
      const t = (s || '').trim();
      return t.length >= 5 && t.length <= 40 && /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(t);
    };
    const m = (form.mother_name ?? '').trim();
    const f = (form.father_name ?? '').trim();
    const r = (form.legal_guardian_name ?? '').trim();
    const motherNameValid = m.length > 0 && isDisplayNameValid(m);
    const fatherNameValid = f.length > 0 && isDisplayNameValid(f);
    const guardianNameValid = r.length > 0 && isDisplayNameValid(r);
    const hasParentPathComplete = motherNameValid || fatherNameValid;
    const hasGuardianPathComplete = guardianNameValid;
    const motherFieldsOptional = fatherNameValid || hasGuardianPathComplete;
    const fatherFieldsOptional = motherNameValid || hasGuardianPathComplete;
    return {
      hasParentPathComplete,
      hasGuardianPathComplete,
      motherFieldsOptional,
      fatherFieldsOptional,
      guardianFieldsOptional: hasParentPathComplete
    };
  }, [form.mother_name, form.father_name, form.legal_guardian_name]);

  const handleFamilyModeToggle = (mode: 'parents' | 'guardian') => {
    if (mode === 'parents') {
      setShowParents(true);
      setShowLegalGuardian(false);
    } else {
      setShowParents(false);
      setShowLegalGuardian(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'birth_date') {
      if (value && (value < birthDateLimits.min || value > birthDateLimits.max)) {
        setBirthDateError('La fecha debe estar en el rango permitido.');
      } else {
        setBirthDateError('');
      }
    }

    if (name === 'province' || name === 'canton' || name === 'district') {
      setLocationStepError('');
    }

    // Handle geographic cascading selection
    if (name === 'province') {
      console.log('Province changed to:', value);
      console.log('Available provinces:', provinces);
      const selectedProvince = provinces.find(p => p.name === value);
      console.log('Selected province:', selectedProvince);

      if (selectedProvince) {
        // Clear form values first
        setForm(prev => ({ ...prev, canton: '', district: '' }));
        // Clear dependent dropdowns
        setCantons([]);
        setDistricts([]);
        // Load cantons for selected province
        console.log('Loading cantons for province ID:', selectedProvince.id);
        loadCantons(selectedProvince.id);
      } else {
        // If no province selected, clear everything
        console.log('No province selected, clearing all');
        setForm(prev => ({ ...prev, canton: '', district: '' }));
        setCantons([]);
        setDistricts([]);
      }
    }

    if (name === 'canton') {
      console.log('Canton changed to:', value);
      console.log('Available cantons:', cantons);
      const selectedCanton = cantons.find(c => c.name === value);
      console.log('Selected canton:', selectedCanton);

      if (selectedCanton) {
        // Clear district form value
        setForm(prev => ({ ...prev, district: '' }));
        // Clear districts dropdown
        setDistricts([]);
        // Load districts for selected canton
        console.log('Loading districts for canton ID:', selectedCanton.id);
        loadDistricts(selectedCanton.id);
      } else {
        // If no canton selected, clear districts
        console.log('No canton selected, clearing districts');
        setForm(prev => ({ ...prev, district: '' }));
        setDistricts([]);
      }
    }
  };

  const checkCedula = async (cedula: string) => {
    setCedulaChecking(true);
    try {
      // Si el usuario ya tiene un expediente, excluirlo de la validación
      const excludeRecordId = currentRecord?.id;
      const available = await checkCedulaAvailability(cedula, excludeRecordId);
      setCedulaAvailable(available);
    } catch (error) {
      console.error('Error verificando cédula:', error);
    } finally {
      setCedulaChecking(false);
    }
  };

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Pre-fill form with currentRecord data when in modification mode
  useEffect(() => {
    if (currentRecord && currentRecord.personal_data && isModification) {
      const personalData = currentRecord.personal_data;
      // Format date for HTML date input (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const formattedDate = formatDateForInput(personalData.birth_date);
      const normalizedPcd = normalizeDisabilityTypes(personalData.pcd_name);

      setForm({
        full_name: personalData.full_name || '',
        pcd_name: normalizedPcd.join(','),
        cedula: personalData.cedula || '',
        gender: personalData.gender || 'male',
        birth_date: formattedDate,
        birth_place: personalData.birth_place || '',
        address: personalData.address || '',
        province: personalData.province || '',
        canton: personalData.canton || '',
        district: personalData.district || '',
        phone: personalData.phone || '',
        mother_name: personalData.mother_name || '',
        mother_cedula: personalData.mother_cedula || '',
        mother_phone: (personalData.mother_phone || '').replace(/\D/g, '').slice(0, 8),
        father_name: personalData.father_name || '',
        father_cedula: personalData.father_cedula || '',
        father_phone: (personalData.father_phone || '').replace(/\D/g, '').slice(0, 8),
        legal_guardian_name: personalData.legal_guardian_name || '',
        legal_guardian_cedula: personalData.legal_guardian_cedula || '',
        legal_guardian_phone: (personalData.legal_guardian_phone || '').replace(/\D/g, '').slice(0, 8),
        mother_occupation: personalData.mother_occupation || '',
        father_occupation: personalData.father_occupation || '',
        legal_guardian_occupation: personalData.legal_guardian_occupation || ''
      });

      setPhase1DisabilityTypes(normalizedPcd);
      setShowDisabilityTypeAddMore(false);
      setDisabilityTypeAddMore('');

      const addrLen = (personalData.address || '').length;
      setAddressCharsLeft(Math.max(0, 150 - addrLen));
      const mainPh = (personalData.phone || '').replace(/\D/g, '').slice(0, 8);
      setPhoneCharsLeft(Math.max(0, 8 - mainPh.length));
      setFullNameCharsLeft(Math.max(0, 40 - String(personalData.full_name || '').length));
      setBirthPlaceCharsLeft(Math.max(0, 40 - String(personalData.birth_place || '').length));
      const mm = (personalData.mother_phone || '').replace(/\D/g, '').slice(0, 8);
      setMotherPhoneCharsLeft(Math.max(0, 8 - mm.length));
      const ff = (personalData.father_phone || '').replace(/\D/g, '').slice(0, 8);
      setFatherPhoneCharsLeft(Math.max(0, 8 - ff.length));
      const gg = (personalData.legal_guardian_phone || '').replace(/\D/g, '').slice(0, 8);
      setResponsiblePhoneCharsLeft(Math.max(0, 8 - gg.length));
      setMotherOccupationCharsLeft(Math.max(0, 40 - String(personalData.mother_occupation || '').length));
      setFatherOccupationCharsLeft(Math.max(0, 40 - String(personalData.father_occupation || '').length));
      setResponsibleOccupationCharsLeft(
        Math.max(0, 40 - String(personalData.legal_guardian_occupation || '').length)
      );

      if (personalData.legal_guardian_name) {
        setShowParents(false);
        setShowLegalGuardian(true);
      } else if (personalData.mother_name || personalData.father_name) {
        setShowParents(true);
        setShowLegalGuardian(false);
      }
    }
  }, [currentRecord, isModification]);

  // Load geographic data after provinces are loaded
  useEffect(() => {
    if (currentRecord && currentRecord.personal_data && isModification && provinces.length > 0) {
      const personalData = currentRecord.personal_data;
      if (personalData.province) {
        const selectedProvince = provinces.find(p => p.name === personalData.province);
        if (selectedProvince) {
          loadCantons(selectedProvince.id);
        }
      }
    }
  }, [provinces, currentRecord, isModification]);

  // Handle canton and district loading when cantons are loaded
  useEffect(() => {
    if (currentRecord && currentRecord.personal_data && isModification && cantons.length > 0) {
      const personalData = currentRecord.personal_data;

      // Set canton value if it's not already set correctly
      if (personalData.canton) {
        // Check if the canton exists in the loaded cantons
        const cantonExists = cantons.find(c => c.name === personalData.canton);
        if (cantonExists && form.canton !== personalData.canton) {
          setForm(prev => ({ ...prev, canton: personalData.canton || '' }));
        }
      }

      // Load districts for the selected canton
      if (personalData.canton) {
        const selectedCanton = cantons.find(c => c.name === personalData.canton);
        if (selectedCanton) {
          loadDistricts(selectedCanton.id);
        }
      }
    }
  }, [cantons, currentRecord, isModification, form.canton]);

  // Update form values when districts are loaded (for pre-filling)
  useEffect(() => {
    if (currentRecord && currentRecord.personal_data && isModification && districts.length > 0) {
      const personalData = currentRecord.personal_data;
      if (personalData.district) {
        // Check if the district exists in the loaded districts
        const districtExists = districts.find(d => d.name === personalData.district);
        if (districtExists && form.district !== personalData.district) {
          setForm(prev => ({ ...prev, district: personalData.district }));
        }
      }
    }
  }, [districts, currentRecord, isModification, form.district]);

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      console.log('Loading provinces...');
      const provincesData = await getProvinces();
      console.log('Loaded provinces from API service:', provincesData);
      console.log('First province structure:', provincesData[0]);
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error cargando provincias:', error);
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadCantons = async (provinceId: number) => {
    setLoadingCantons(true);
    try {
      console.log('Loading cantons for province ID:', provinceId);
      const cantonsData = await getCantonsByProvince(provinceId);
      console.log('Loaded cantons:', cantonsData);
      setCantons(cantonsData);
    } catch (error) {
      console.error('Error cargando cantones:', error);
      setCantons([]);
    } finally {
      setLoadingCantons(false);
    }
  };

  const loadDistricts = async (cantonId: number) => {
    setLoadingDistricts(true);
    try {
      console.log('Loading districts for canton ID:', cantonId);
      const districtsData = await getDistrictsByCanton(cantonId);
      console.log('Loaded districts:', districtsData);
      setDistricts(districtsData);
    } catch (error) {
      console.error('Error cargando distritos:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Usar currentRecord para evitar warning del linter
  console.log('Current record:', currentRecord?.id);

  const isDisplayNameValid = (s: string) => {
    const t = (s || '').trim();
    return t.length >= 5 && t.length <= 40 && /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(t);
  };

  /** Alineado con Phase3Form: nombres, cédulas, teléfonos, fechas, dirección y ubicación. */
  const validatePhase1Form = (): boolean => {
    let ok = true;

    const fullName = form.full_name.trim();
    if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(fullName) || fullName.length < 5 || fullName.length > 40) {
      setFullNameError(
        fullName.length < 5 && fullName.length > 0
          ? 'Mínimo 5 caracteres.'
          : fullName.length > 40
            ? 'Máximo 40 caracteres.'
            : 'Solo se permiten letras y espacios.'
      );
      ok = false;
    } else setFullNameError('');

    const phoneDigits = (form.phone || '').replace(/\D/g, '');
    if (!/^\d{8}$/.test(phoneDigits)) {
      setPhoneError(
        phoneDigits.length === 0 ? 'Este campo es obligatorio.' : 'Formato inválido. Use 88888888.'
      );
      ok = false;
    } else setPhoneError('');

    const bp = (form.birth_place || '').trim();
    if (
      !/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(form.birth_place || '') ||
      bp.length === 0 ||
      (form.birth_place || '').length > 40
    ) {
      setBirthPlaceError(
        bp.length === 0
          ? 'Este campo es obligatorio.'
          : (form.birth_place || '').length > 40
            ? 'Máximo 40 caracteres.'
            : 'Solo se permiten letras y espacios.'
      );
      ok = false;
    } else setBirthPlaceError('');

    const addr = form.address || '';
    if (addr.trim().length === 0) {
      setAddressError('Este campo es obligatorio.');
      ok = false;
    } else if (addr.length > 150) {
      setAddressError('Máximo 150 caracteres.');
      ok = false;
    } else setAddressError('');

    const bd = form.birth_date;
    if (!bd || bd < birthDateLimits.min || bd > birthDateLimits.max) {
      setBirthDateError(
        !bd ? 'Este campo es obligatorio.' : 'La fecha de nacimiento debe estar entre el rango permitido.'
      );
      ok = false;
    } else setBirthDateError('');

    if (!form.province?.trim() || !form.canton?.trim() || !form.district?.trim()) {
      setLocationStepError('Seleccione provincia, cantón y distrito.');
      ok = false;
    } else setLocationStepError('');

    const mName = (form.mother_name ?? '').trim();
    const fName = (form.father_name ?? '').trim();
    const rName = (form.legal_guardian_name ?? '').trim();

    const motherNameValid = mName.length > 0 && isDisplayNameValid(mName);
    const fatherNameValid = fName.length > 0 && isDisplayNameValid(fName);
    const guardianNameValid = rName.length > 0 && isDisplayNameValid(rName);
    const hasParentPathComplete = motherNameValid || fatherNameValid;
    const hasGuardianPathComplete = guardianNameValid;

    if (!hasParentPathComplete && !hasGuardianPathComplete) {
      setFamilyBlockError(
        'Debe completar al menos la información de un padre o madre, o del encargado legal (nombre con mínimo 5 caracteres).'
      );
      ok = false;
    } else setFamilyBlockError('');

    const mCed = form.mother_cedula || '';
    if (mCed && (!/^\d+$/.test(mCed) || mCed.length < 9 || mCed.length > 13)) {
      setMotherCedulaError('La cédula debe tener entre 9 y 13 dígitos numéricos.');
      ok = false;
    } else setMotherCedulaError('');

    if (mName) {
      if (!isDisplayNameValid(mName)) {
        setMotherNameError(
          mName.length < 5
            ? 'Mínimo 5 caracteres.'
            : mName.length > 40
              ? 'Máximo 40 caracteres.'
              : 'Solo letras y espacios.'
        );
        ok = false;
      } else setMotherNameError('');
    } else setMotherNameError('');

    const mOcc = form.mother_occupation || '';
    if (mOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(mOcc) || mOcc.length > 40)) {
      setMotherOccupationError('Máximo 40 caracteres, solo letras.');
      ok = false;
    } else setMotherOccupationError('');

    const mPhoneDigits = (form.mother_phone || '').replace(/\D/g, '');
    if (mPhoneDigits && !/^\d{8}$/.test(mPhoneDigits)) {
      setMotherPhoneError('Formato inválido. Use 88888888 (8 dígitos).');
      ok = false;
    } else setMotherPhoneError('');

    const fCed = form.father_cedula || '';
    if (fCed && (!/^\d+$/.test(fCed) || fCed.length < 9 || fCed.length > 13)) {
      setFatherCedulaError('La cédula debe tener entre 9 y 13 dígitos numéricos.');
      ok = false;
    } else setFatherCedulaError('');

    if (fName) {
      if (!isDisplayNameValid(fName)) {
        setFatherNameError(
          fName.length < 5
            ? 'Mínimo 5 caracteres.'
            : fName.length > 40
              ? 'Máximo 40 caracteres.'
              : 'Solo letras y espacios.'
        );
        ok = false;
      } else setFatherNameError('');
    } else setFatherNameError('');

    const fOcc = form.father_occupation || '';
    if (fOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(fOcc) || fOcc.length > 40)) {
      setFatherOccupationError('Máximo 40 caracteres, solo letras.');
      ok = false;
    } else setFatherOccupationError('');

    const fPhoneDigits = (form.father_phone || '').replace(/\D/g, '');
    if (fPhoneDigits && !/^\d{8}$/.test(fPhoneDigits)) {
      setFatherPhoneError('Formato inválido. Use 88888888 (8 dígitos).');
      ok = false;
    } else setFatherPhoneError('');

    if (rName) {
      if (!isDisplayNameValid(rName)) {
        setResponsibleNameError(
          rName.length < 5
            ? 'Mínimo 5 caracteres.'
            : rName.length > 40
              ? 'Máximo 40 caracteres.'
              : 'Solo se permiten letras y espacios.'
        );
        ok = false;
      } else setResponsibleNameError('');
    } else setResponsibleNameError('');

    const rCed = form.legal_guardian_cedula || '';
    if (rCed && (!/^\d+$/.test(rCed) || rCed.length < 9 || rCed.length > 13)) {
      setResponsibleCedulaError('La cédula debe tener entre 9 y 13 dígitos numéricos.');
      ok = false;
    } else setResponsibleCedulaError('');

    const rOcc = form.legal_guardian_occupation || '';
    if (rOcc && (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(rOcc) || rOcc.length > 40)) {
      setResponsibleOccupationError('Máximo 40 caracteres, solo letras.');
      ok = false;
    } else setResponsibleOccupationError('');

    const rPhoneDigits = (form.legal_guardian_phone || '').replace(/\D/g, '');
    if (rPhoneDigits && !/^\d{8}$/.test(rPhoneDigits)) {
      setResponsiblePhoneError('Formato inválido. Use 88888888 (8 dígitos).');
      ok = false;
    } else setResponsiblePhoneError('');

    const cedulaDigits = form.cedula.replace(/\D/g, '');
    if (!/^\d+$/.test(form.cedula) || cedulaDigits.length === 0) {
      setCedulaError(cedulaDigits.length === 0 ? 'Este campo es obligatorio.' : 'Solo se permiten números.');
      ok = false;
    } else if (cedulaDigits.length < 9 || cedulaDigits.length > 13) {
      setCedulaError(cedulaDigits.length < 9 ? 'Mínimo 9 dígitos.' : 'Máximo 13 dígitos.');
      ok = false;
    } else setCedulaError('');

    return ok;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhase1Form()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (cedulaAvailable === false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (phase1DisabilityTypes.length === 0) {
      setPcdNameError('Seleccione al menos un tipo de discapacidad.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setPcdNameError('');

    const optionalPhoneDigits = (p?: string) => {
      const d = (p || '').replace(/\D/g, '').slice(0, 8);
      return d.length > 0 ? d : undefined;
    };

    const cleanedForm: Phase1Data = {
      ...form,
      pcd_name: phase1DisabilityTypes.join(','),
      phone: (form.phone || '').replace(/\D/g, '').slice(0, 8),
      mother_phone: optionalPhoneDigits(form.mother_phone),
      father_phone: optionalPhoneDigits(form.father_phone),
      legal_guardian_phone: optionalPhoneDigits(form.legal_guardian_phone)
    };

    onSubmit(cleanedForm);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isModification ? 'Modificar Información Personal' : 'Información Personal Básica'}
          </h3>
          <p className="text-gray-600">
            {isModification ? 'Actualice sus datos personales según las observaciones del administrador' : 'Complete sus datos personales para iniciar el proceso'}
          </p>
          <p className="text-xs text-gray-500">
            {isModification ? `Modificando expediente (ID: ${currentRecord?.id}) - Los datos actuales están pre-cargados` :
              currentRecord ? `Editando expediente existente (ID: ${currentRecord.id})` : 'Creando nuevo expediente'}
          </p>
          {/* Usar currentRecord para evitar warning del linter */}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.id}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.phase}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.status}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.record_number}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.created_at}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.updated_at}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.personal_data?.full_name}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.personal_data?.cedula}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.notes?.length}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.notes?.map((note, index) => <span key={index}>{note.note}</span>).join(', ')}</div>}
          {currentRecord && <div style={{ display: 'none' }}>{currentRecord.notes?.map((note, index) => <span key={index}>{note.created_at}</span>).join(', ')}</div>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
         
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo 
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={(e) => {
                const value = e.target.value;
                const isValid = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value);
                const length = value.length;

                if (!isValid) {
                  setFullNameError('Solo se permiten letras y espacios.');
                  return;
                }

                if (length > 40) {
                  setFullNameError('Máximo 40 caracteres.');
                  return;
                }

                setFullNameError('');
                setForm(prev => ({ ...prev, full_name: value }));
                setFullNameCharsLeft(40 - length);
              }}
              maxLength={40}
              className={`w-full px-3 py-2 border ${fullNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
              placeholder="Ej: Nombre, Apellido, Apellido2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {fullNameCharsLeft} caracteres restantes (mínimo 5, máximo 40)
            </p>
            {fullNameError && <p className="text-xs text-red-500 mt-1">{fullNameError}</p>}
          </div>
          
          <div className="space-y-3">
            <label htmlFor="phase1_disability_primary" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de discapacidad 
            </label>
            <select
              id="phase1_disability_primary"
              name="phase1_disability_primary"
              value={phase1DisabilityTypes[0] ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                setPcdNameError('');
                if (!raw) {
                  applyPhase1DisabilityTypes(phase1DisabilityTypes.slice(1));
                  return;
                }
                const v = raw as DisabilityTypeOption;
                const rest = phase1DisabilityTypes.slice(1).filter((t) => t !== v);
                applyPhase1DisabilityTypes([v, ...rest]);
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                pcdNameError ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar (principal)</option>
              {DISABILITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

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
                      <label htmlFor="phase1_disability_add_more" className="text-sm font-medium text-gray-700">
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
                      id="phase1_disability_add_more"
                      value={disabilityTypeAddMore}
                      onChange={(e) => {
                        const v = e.target.value as DisabilityTypeOption | '';
                        if (v) {
                          setPcdNameError('');
                          if (!phase1DisabilityTypes.includes(v)) {
                            applyPhase1DisabilityTypes([...phase1DisabilityTypes, v]);
                          }
                        }
                        setDisabilityTypeAddMore('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccione un tipo adicional…</option>
                      {DISABILITY_TYPE_OPTIONS.filter((o) => !phase1DisabilityTypes.includes(o.value)).map(
                        (opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </>
            )}

            {phase1DisabilityTypes.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {phase1DisabilityTypes.slice(1).map((t) => (
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
                        setPcdNameError('');
                        applyPhase1DisabilityTypes(phase1DisabilityTypes.filter((x) => x !== t));
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {pcdNameError && <p className="text-xs text-red-500">{pcdNameError}</p>}
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Cédula 
          </label>
          <div className="relative">
            <input
              type="text"
              name="cedula"
              value={form.cedula}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
                setForm(prev => ({ ...prev, cedula: digits }));
                // No mostrar error para longitudes intermedias
                setCedulaError('');
                setCedulaCharsLeft(13 - digits.length);

                if (digits.length >= 9 && digits.length <= 13) {
                  checkCedula(digits);
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${cedulaAvailable === false || cedulaError ? 'border-red-300' : cedulaAvailable === true ? 'border-green-300' : 'border-gray-300'}`}
              required
              placeholder="Nacional u Dimex."
            />
            {form.cedula.length < 9 && (
              <p className="text-xs text-gray-500 mt-1">
                {cedulaCharsLeft} caracteres restantes (entre 9 y 13 dígitos)
              </p>
            )}
            {cedulaChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
            {cedulaError && (
              <p className="text-red-600 text-sm mt-1">{cedulaError}</p>
            )}
            {cedulaAvailable === false && (
              <p className="text-red-600 text-sm mt-1">Esta cédula ya está registrada en nuestro sistema, por favor ingrese una cédula diferente.</p>
            )}
            {cedulaAvailable === true && (
              <p className="text-green-600 text-sm mt-1">Cédula disponible</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sexo 
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono 
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={(e) => {
              const rawValue = e.target.value;
              // Verificar si hay caracteres no numéricos (excepto el guion permitido)
              if (/[^\d-]/.test(rawValue)) {
                setPhoneError('Solo se permiten números.');
                return;
              }

              const digits = rawValue.replace(/\D/g, '').slice(0, 8);
              let formatted = digits;
              if (digits.length > 4) {
                formatted = `${digits.slice(0, 8)}`;
              }
              if (formatted.length > 9) return;

              setPhoneError('');
              setForm(prev => ({ ...prev, phone: formatted }));
              setPhoneCharsLeft(8 - digits.length);
            }}
            className={`w-full px-3 py-2 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {phoneCharsLeft} dígitos restantes (8 obligatorios; formato: 9999-9999)
          </p>
          {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento 
          </label>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            min={birthDateLimits.min}
            max={birthDateLimits.max}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${birthDateError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Entre {birthDateLimits.min} y {birthDateLimits.max}
          </p>
          {birthDateError && <p className="text-xs text-red-500 mt-1">{birthDateError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lugar de Nacimiento 
          </label>
          <input
            type="text"
            name="birth_place"
            value={form.birth_place}
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
              setForm(prev => ({ ...prev, birth_place: value }));
              setBirthPlaceCharsLeft(40 - length);
            }}
            maxLength={40}
            className={`w-full px-3 py-2 border ${birthPlaceError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
            placeholder="Ej: Nicoya, Guanacaste"
          />
          <p className="text-xs text-gray-500 mt-1">
            {birthPlaceCharsLeft} caracteres restantes (máximo 40)
          </p>
          {birthPlaceError && <p className="text-xs text-red-500 mt-1">{birthPlaceError}</p>}
        </div>
      
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={(e) => {
              const value = e.target.value;
              const length = value.length;

              if (length > 150) {
                setAddressError('Máximo 150 caracteres.');
                return;
              }

              setAddressError('');
              setForm(prev => ({ ...prev, address: value }));
              setAddressCharsLeft(150 - length);
            }}
            rows={3}
            maxLength={150}
            className={`w-full px-3 py-2 border ${addressError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {addressCharsLeft} caracteres restantes (máximo 150)
          </p>
          {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provincia *
            </label>
            <select
              name="province"
              value={form.province}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loadingProvinces}
            >
              <option value="">Seleccione una provincia</option>
              {Array.isArray(provinces) && provinces.map((province) => (
                <option key={province.id} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            {loadingProvinces && (
              <p className="text-sm text-gray-500 mt-1">Cargando provincias...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantón *
            </label>
            <select
              name="canton"
              value={form.canton}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!form.province || loadingCantons}
            >
              <option value="">Seleccione un cantón</option>
              {Array.isArray(cantons) && cantons.map((canton) => (
                <option key={canton.id} value={canton.name}>
                  {canton.name}
                </option>
              ))}
            </select>
            {loadingCantons && (
              <p className="text-sm text-gray-500 mt-1">Cargando cantones...</p>
            )}
            {!loadingCantons && form.province && cantons.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">No se encontraron cantones para esta provincia</p>
            )}
            {!loadingCantons && cantons.length > 0 && (
              <p className="text-sm text-green-600 mt-1">{cantons.length} cantones disponibles</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distrito *
            </label>
            <select
              name="district"
              value={form.district}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!form.canton || loadingDistricts}
            >
              <option value="">Seleccione un distrito</option>
              {Array.isArray(districts) && districts.map((district) => (
                <option key={district.id} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
            {loadingDistricts && (
              <p className="text-sm text-gray-500 mt-1">Cargando distritos...</p>
            )}
            {!loadingDistricts && form.canton && districts.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">No se encontraron distritos para este cantón</p>
            )}
            {!loadingDistricts && districts.length > 0 && (
              <p className="text-sm text-green-600 mt-1">{districts.length} distritos disponibles</p>
            )}
          </div>
        </div>
        {locationStepError && (
          <p className="text-sm text-red-600" role="alert">
            {locationStepError}
          </p>
        )}

        {/* Parent/Guardian Information — alineado con Phase3Form (paso familia) */}
        <div className="border-t pt-6">
          <div className={`border rounded-lg p-4 sm:p-6 border-gray-200`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 min-w-0">
                  Información Familiar — requiere un padre/madre o encargado legal
                </h3>
              </div>

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
              <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm" role="alert">
                {familyBlockError}
              </div>
            )}

            {showParents && (
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-md font-medium text-gray-800">Información de la Madre</h4>
                  <button
                    type="button"
                    onClick={() => setMotherSectionOpen((v) => !v)}
                    className="shrink-0 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px]"
                    aria-expanded={motherSectionOpen}
                    aria-controls="phase1-mother-fields"
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
                <div id="phase1-mother-fields" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Madre {familyPathCompletion.motherFieldsOptional ? '(opcional)' : ''}
                    </label>
                    <input
                      type="text"
                      value={form.mother_name || ''}
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
                        setForm(prev => ({ ...prev, mother_name: value }));
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
                      value={form.mother_cedula || ''}
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
                        setForm(prev => ({ ...prev, mother_cedula: rawValue }));
                        setMotherCedulaCharsLeft(13 - rawValue.length);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="Nacional u Dimex."
                    />
                    {(form.mother_cedula || '').length < 9 && (
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
                      value={form.mother_occupation || ''}
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
                        setForm(prev => ({ ...prev, mother_occupation: value }));
                        setMotherOccupationCharsLeft(40 - length);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${motherOccupationError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="Mín. 5 caracteres"
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
                      value={form.mother_phone || ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setMotherPhoneError('');
                        setForm(prev => ({ ...prev, mother_phone: digits }));
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

            {showParents && (
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-md font-medium text-gray-800">Información del Padre</h4>
                  <button
                    type="button"
                    onClick={() => setFatherSectionOpen((v) => !v)}
                    className="shrink-0 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px]"
                    aria-expanded={fatherSectionOpen}
                    aria-controls="phase1-father-fields"
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
                <div id="phase1-father-fields" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Padre {familyPathCompletion.fatherFieldsOptional ? '(opcional)' : ''}
                    </label>
                    <input
                      type="text"
                      value={form.father_name || ''}
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
                        setForm(prev => ({ ...prev, father_name: value }));
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
                      value={form.father_cedula || ''}
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
                        setForm(prev => ({ ...prev, father_cedula: rawValue }));
                        setFatherCedulaCharsLeft(13 - rawValue.length);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="Nacional u Dimex."
                    />
                    {(form.father_cedula || '').length < 9 && (
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
                      value={form.father_occupation || ''}
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
                        setForm(prev => ({ ...prev, father_occupation: value }));
                        setFatherOccupationCharsLeft(40 - length);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${fatherOccupationError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="Mín. 5 caracteres"
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
                      value={form.father_phone || ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setFatherPhoneError('');
                        setForm(prev => ({ ...prev, father_phone: digits }));
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
                      value={form.legal_guardian_name || ''}
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
                        setForm(prev => ({ ...prev, legal_guardian_name: value }));
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
                      value={form.legal_guardian_cedula || ''}
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
                        setForm(prev => ({ ...prev, legal_guardian_cedula: rawValue }));
                        setResponsibleCedulaCharsLeft(13 - rawValue.length);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsibleCedulaError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="Nacional u Dimex."
                    />
                    {(form.legal_guardian_cedula || '').length < 9 && (
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
                      value={form.legal_guardian_occupation || ''}
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
                        setForm(prev => ({ ...prev, legal_guardian_occupation: value }));
                        setResponsibleOccupationCharsLeft(40 - length);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${responsibleOccupationError ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="Mín. 5 caracteres"
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
                      value={form.legal_guardian_phone || ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setResponsiblePhoneError('');
                        setForm(prev => ({ ...prev, legal_guardian_phone: digits }));
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
        </div>

        <div className="flex justify-between items-center">
          {onBackToIntro && (
            <button
              type="button"
              onClick={onBackToIntro}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Volver a información
            </button>
          )}
          <button
            type="submit"
            disabled={loading || cedulaAvailable === false}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : (isModification ? 'Actualizar Expediente' : 'Enviar Solicitud')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Phase1Form;
