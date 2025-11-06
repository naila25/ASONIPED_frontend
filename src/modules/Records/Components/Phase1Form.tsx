import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { checkCedulaAvailability } from '../Services/recordsApi';
import { getProvinces, getCantonsByProvince, getDistrictsByCanton, type Province, type Canton, type District } from '../Services/geographicApi';
import type { Phase1Data, RecordWithDetails } from '../Types/records';

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
  });
  const [cedulaAvailable, setCedulaAvailable] = useState<boolean | null>(null);
  const [cedulaChecking, setCedulaChecking] = useState(false);

  // Validation states
  const [fullNameError, setFullNameError] = useState("");
  const [fullNameCharsLeft, setFullNameCharsLeft] = useState(40);

  const [cedulaError, setCedulaError] = useState("");
  const [cedulaCharsLeft, setCedulaCharsLeft] = useState(12);

  const [phoneError, setPhoneError] = useState("");
  const [phoneCharsLeft, setPhoneCharsLeft] = useState(9);

  const [birthPlaceError, setBirthPlaceError] = useState("");
  const [birthPlaceCharsLeft, setBirthPlaceCharsLeft] = useState(40);

  const [addressError, setAddressError] = useState("");
  const [addressCharsLeft, setAddressCharsLeft] = useState(255);

  // Validaciones para Información Familiar
  const [motherNameError, setMotherNameError] = useState('');
  const [motherNameCharsLeft, setMotherNameCharsLeft] = useState(40);
  const [motherCedulaError, setMotherCedulaError] = useState('');
  const [motherCedulaCharsLeft, setMotherCedulaCharsLeft] = useState(12);
  const [motherPhoneError, setMotherPhoneError] = useState('');
  const [motherPhoneCharsLeft, setMotherPhoneCharsLeft] = useState(9);

  const [fatherNameError, setFatherNameError] = useState('');
  const [fatherNameCharsLeft, setFatherNameCharsLeft] = useState(40);
  const [fatherCedulaError, setFatherCedulaError] = useState('');
  const [fatherCedulaCharsLeft, setFatherCedulaCharsLeft] = useState(12);
  const [fatherPhoneError, setFatherPhoneError] = useState('');
  const [fatherPhoneCharsLeft, setFatherPhoneCharsLeft] = useState(9);

  const [responsibleNameError, setResponsibleNameError] = useState('');
  const [responsibleNameCharsLeft, setResponsibleNameCharsLeft] = useState(40);
  const [responsibleCedulaError, setResponsibleCedulaError] = useState('');
  const [responsibleCedulaCharsLeft, setResponsibleCedulaCharsLeft] = useState(12);
  const [responsiblePhoneError, setResponsiblePhoneError] = useState('');
  const [responsiblePhoneCharsLeft, setResponsiblePhoneCharsLeft] = useState(9);


  // Geographic data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Parent/guardian selection state
  const [hasParents, setHasParents] = useState(true);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "full_name") {
      if (value.length > 150) {
        setFullNameError("El nombre completo no puede tener más de 150 caracteres.");
        return;
      }
      const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
      if (!regex.test(value) && value !== "") {
        setFullNameError("Solo se permiten letras y espacios. No se permiten números ni caracteres especiales.");
        return;
      }
      setForm(prev => ({ ...prev, [name]: value }));
      setFullNameError("");
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));



    // Validación básica para cédula
    if (name === "cedula") {
      // Solo permite números, elimina cualquier letra o símbolo
      const onlyNums = value.replace(/[^0-9]/g, "");
      // Limita a 12 dígitos
      if (onlyNums.length > 12) {
        setCedulaError("La cédula no puede tener más de 12 números.");
        setForm(prev => ({ ...prev, [name]: onlyNums.slice(0, 12) }));
        return;
      }
      // No mostrar error para longitudes intermedias; solo limpiar
      setCedulaError("");
      setForm(prev => ({ ...prev, [name]: onlyNums }));
      // Verificar disponibilidad cuando tenga 9 o 12 dígitos
      if (onlyNums.length === 9 || onlyNums.length === 12) {
        checkCedula(onlyNums);
      }
      return;
    }

    // Validación y formateo para teléfono
    if (name === "phone") {
      // Elimina guiones y caracteres no numéricos
      const onlyNums = value.replace(/[^0-9]/g, "");
      // Permite solo máximo 8 dígitos
      if (onlyNums.length > 8) {
        setPhoneError("El teléfono solo puede tener 8 dígitos.");
        return;
      }
      // Si no es vacío y no tiene exactamente 8 dígitos, muestra error (puedes ajustar según si quieres permitir menos)
      if (onlyNums.length === 8) {
        setPhoneError(""); // Sin error
      } else if (onlyNums.length > 0 && onlyNums.length < 8) {
        setPhoneError("El teléfono debe tener 8 dígitos.");
      } else {
        setPhoneError("");
      }
      // Pone el guion después del cuarto dígito automáticamente
      let formatted = onlyNums;
      if (onlyNums.length > 4) {
        formatted = onlyNums.slice(0, 4) + '-' + onlyNums.slice(4);
      }
      setForm(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    // Validación para lugar de nacimiento 
    if (name === "birth_place") {
      // Filtra el valor permitiendo solo letras y espacios (incluye acentos y ñ)
      const filteredValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
      if (filteredValue.length > 30) {
        setBirthPlaceError("La nacionalidad no puede tener más de 30 caracteres.");
        setForm(prev => ({ ...prev, [name]: filteredValue.slice(0, 30) }));
        return;
      }
      if (filteredValue.trim() === "") {
        setBirthPlaceError("Este campo es obligatorio.");
        setForm(prev => ({ ...prev, [name]: filteredValue }));
        return;
      }
      setBirthPlaceError("");
      setForm(prev => ({ ...prev, [name]: filteredValue }));
      return;
    }

    // Validación para dirección (solo longitud máxima)
    if (name === "address") {
      if (value.length > 255) {
        setAddressError("La dirección no puede tener más de 255 caracteres.");
        setForm(prev => ({ ...prev, [name]: value.slice(0, 255) }));
        return;
      }
      setAddressError("");
      setForm(prev => ({ ...prev, [name]: value }));
      return;
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

      setForm({
        full_name: personalData.full_name || '',
        pcd_name: personalData.pcd_name || '',
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
        mother_phone: personalData.mother_phone || '',
        father_name: personalData.father_name || '',
        father_cedula: personalData.father_cedula || '',
        father_phone: personalData.father_phone || '',
        legal_guardian_name: personalData.legal_guardian_name || '',
        legal_guardian_cedula: personalData.legal_guardian_cedula || '',
        legal_guardian_phone: personalData.legal_guardian_phone || ''
      });

      // Set parent/guardian selection based on data
      const hasMother = !!(personalData.mother_name && personalData.mother_cedula);
      const hasFather = !!(personalData.father_name && personalData.father_cedula);
      const hasGuardian = !!(personalData.legal_guardian_name && personalData.legal_guardian_cedula);


      if (hasMother || hasFather) {
        setHasParents(true);
      } else if (hasGuardian) {
        setHasParents(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cedulaAvailable === false) {
      alert('Esta cédula ya está registrada en el sistema');
      return;
    }

    // Validate disability type selection
    if (!form.pcd_name || form.pcd_name === '') {
      alert('Debe seleccionar un tipo de discapacidad');
      return;
    }

    // Validate that at least one parent or legal guardian is provided
    if (hasParents) {
      if (!form.mother_name && !form.father_name) {
        alert('Debe proporcionar al menos el nombre de la madre o del padre');
        return;
      }
      // If mother name is provided, mother cedula is required
      if (form.mother_name && !form.mother_cedula) {
        alert('Si proporciona el nombre de la madre, también debe proporcionar su cédula');
        return;
      }
      // If father name is provided, father cedula is required
      if (form.father_name && !form.father_cedula) {
        alert('Si proporciona el nombre del padre, también debe proporcionar su cédula');
        return;
      }
    } else {
      if (!form.legal_guardian_name || !form.legal_guardian_cedula) {
        alert('Debe proporcionar el nombre y cédula del encargado legal');
        return;
      }
    }

    // Clean up form data before submission
    // Allow sending BOTH parents and legal guardian info simultaneously when provided
    const cleanedForm: Phase1Data = {
      ...form,
      pcd_name: form.pcd_name as Phase1Data['pcd_name']
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
              Nombre Completo *
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

                if (length > 30) {
                  setFullNameError('Máximo 40 caracteres.');
                  return;
                }

                setFullNameError('');
                setForm(prev => ({ ...prev, full_name: value }));
                setFullNameCharsLeft(40 - length);
              }}
              className={`w-full px-3 py-2 border ${fullNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {fullNameCharsLeft} caracteres restantes (máximo 40)
            </p>
            {fullNameError && <p className="text-xs text-red-500 mt-1">{fullNameError}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Discapacidad *
          </label>
          <select
            name="pcd_name"
            value={form.pcd_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleccione la discapacidad</option>
            <option value="fisica">Discapacidad Física</option>
            <option value="visual">Discapacidad Visual</option>
            <option value="auditiva">Discapacidad Auditiva</option>
            <option value="psicosocial">Discapacidad Psicosocial</option>
            <option value="cognitiva">Discapacidad Cognitiva</option>
            <option value="intelectual">Discapacidad Intelectual</option>
            <option value="multiple">Discapacidad Múltiple</option>
          </select>
        </div>



        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cédula *
          </label>
          <div className="relative">
            <input
              type="text"
              name="cedula"
              value={form.cedula}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                setForm(prev => ({ ...prev, cedula: digits }));
                // No mostrar error para longitudes intermedias
                setCedulaError('');
                setCedulaCharsLeft(12 - digits.length);

                if (digits.length === 9 || digits.length === 12) {
                  checkCedula(digits);
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${cedulaAvailable === false || cedulaError ? 'border-red-300' : cedulaAvailable === true ? 'border-green-300' : 'border-gray-300'}`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {cedulaCharsLeft} caracteres restantes (máximo 12)
            </p>
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
            Género *
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
                formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
              }
              if (formatted.length > 9) return;

              setPhoneError('');
              setForm(prev => ({ ...prev, phone: formatted }));
              setPhoneCharsLeft(9 - formatted.length);
            }}
            className={`w-full px-3 py-2 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <p className="text-xs text-gray-500 mt-1">
            {phoneCharsLeft} caracteres restantes (máximo 9, formato: 9999-9999)
          </p>
          {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nacionalidad *
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

              if (length > 30) {
                setBirthPlaceError('Máximo 40 caracteres.');
                return;
              }

              setBirthPlaceError('');
              setForm(prev => ({ ...prev, birth_place: value }));
              setBirthPlaceCharsLeft(40 - length);
            }}
            className={`w-full px-3 py-2 border ${birthPlaceError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {birthPlaceCharsLeft} caracteres restantes (máximo 40)
          </p>
          {birthPlaceError && <p className="text-xs text-red-500 mt-1">{birthPlaceError}</p>}
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

              if (length > 255) {
                setAddressError('Máximo 255 caracteres.');
                return;
              }

              setAddressError('');
              setForm(prev => ({ ...prev, address: value }));
              setAddressCharsLeft(255 - length);
            }}
            rows={3}
            className={`w-full px-3 py-2 border ${addressError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {addressCharsLeft} caracteres restantes (máximo 255)
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


        {/* Parent/Guardian Information */}
        <div className="border-t pt-6">
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Información de padres o encargado legal, al menos un uno es requerido</h4>
            <p className="text-sm text-gray-600 mb-4">
              Seleccione si el beneficiario tiene padres o un encargado legal
            </p>

            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
              <button
                type="button"
                onClick={() => setHasParents(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${hasParents
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Información de Padres
              </button>
              <button
                type="button"
                onClick={() => setHasParents(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!hasParents
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Encargado Legal
              </button>
            </div>
          </div>

          {hasParents ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="col-span-full">
                <hr className="my-4 border-t border-gray-200" />
                <h4 className="text-sm font-medium text-gray-700 mb-4">Información de la Madre</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Madre
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
                    setForm(prev => ({
                      ...prev,
                      mother_name: value
                    }));
                    setMotherNameCharsLeft(40 - length);
                  }}
                  className={`w-full px-3 py-2 border ${motherNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder='Opcional'
                />
                <p className="text-xs text-gray-500 mt-1">
                  {motherNameCharsLeft} caracteres restantes (Máximo 40)
                </p>
                {motherNameError && <p className="text-xs text-red-500 mt-1">{motherNameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula de la Madre
                </label>
                <input
                  type="text"
                  value={form.mother_cedula || ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setForm(prev => ({
                      ...prev,
                      mother_cedula: digits
                    }));
                    // No mostrar error para longitudes intermedias
                    setMotherCedulaError('');
                    setMotherCedulaCharsLeft(12 - digits.length);
                  }}
                  className={`w-full px-3 py-2 border ${motherCedulaError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder='Opcional'
                />
                <p className="text-xs text-gray-500 mt-1">
                  {motherCedulaCharsLeft} caracteres restantes (Máximo 12)
                </p>
                {motherCedulaError && <p className="text-xs text-red-500 mt-1">{motherCedulaError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de la Madre
                </label>
                <input
                  type="text"
                  value={form.mother_phone || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    // Verificar si hay caracteres no numéricos (excepto el guion permitido)
                    if (/[^\d-]/.test(rawValue)) {
                      setMotherPhoneError('Solo se permiten números.');
                      return;
                    }
                    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
                    let formatted = digits;
                    if (digits.length > 4) {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                    }
                    if (formatted.length > 9) return;

                    setMotherPhoneError('');
                    setForm(prev => ({
                      ...prev,
                      mother_phone: formatted
                    }));
                    setMotherPhoneCharsLeft(9 - formatted.length);
                  }}
                  className={`w-full px-3 py-2 border ${motherPhoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder='Opcional'
                />
                <p className="text-xs text-gray-500 mt-1">
                  {motherPhoneCharsLeft} caracteres restantes (Máximo 9, formato: 8888-8888)
                </p>
                {motherPhoneError && <p className="text-xs text-red-500 mt-1">{motherPhoneError}</p>}
              </div>

              <div className="col-span-full">
                <hr className="my-4 border-t border-gray-200" />
                <h4 className="text-sm font-medium text-gray-700 mb-4">Información del Padre</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Padre
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
                    setForm(prev => ({
                      ...prev,
                      father_name: value
                    }));
                    setFatherNameCharsLeft(40 - length);
                  }}
                  className={`w-full px-3 py-2 border ${fatherNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder='Opcional'
                />
                <p className="text-xs text-gray-500 mt-1">
                  {fatherNameCharsLeft} caracteres restantes (Máximo 40)
                </p>
                {fatherNameError && <p className="text-xs text-red-500 mt-1">{fatherNameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula del Padre
                </label>
                <input
                  type="text"
                  value={form.father_cedula || ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setForm(prev => ({
                      ...prev,
                      father_cedula: digits
                    }));
                    // No mostrar error para longitudes intermedias
                    setFatherCedulaError('');
                    setFatherCedulaCharsLeft(12 - digits.length);
                  }}
                  className={`w-full px-3 py-2 border ${fatherCedulaError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder='Opcional'
                />
                <p className="text-xs text-gray-500 mt-1">
                  {fatherCedulaCharsLeft} caracteres restantes (Máximo 12)
                </p>
                {fatherCedulaError && <p className="text-xs text-red-500 mt-1">{fatherCedulaError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del Padre
                </label>
                <input
                  type="text"
                  value={form.father_phone || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    // Verificar si hay caracteres no numéricos (excepto el guion permitido)
                    if (/[^\d-]/.test(rawValue)) {
                      setFatherPhoneError('Solo se permiten números.');
                      return;
                    }
                    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
                    let formatted = digits;
                    if (digits.length > 4) {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                    }
                    if (formatted.length > 9) return;

                    setFatherPhoneError('');
                    setForm(prev => ({
                      ...prev,
                      father_phone: formatted
                    }));
                    setFatherPhoneCharsLeft(9 - formatted.length);
                  }}
                  className={`w-full px-3 py-2 border ${fatherPhoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder='Opcional'
                />
                <p className="text-xs text-gray-500 mt-1">
                  {fatherPhoneCharsLeft} caracteres restantes (Máximo 9, formato: 8888-8888)
                </p>
                {fatherPhoneError && <p className="text-xs text-red-500 mt-1">{fatherPhoneError}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="col-span-full">
                <hr className="my-4 border-t border-gray-200" />
                <h4 className="text-sm font-medium text-gray-700 mb-4">Información del Encargado Legal</h4>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Encargado Legal *
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
                    setForm(prev => ({
                      ...prev,
                      legal_guardian_name: value
                    }));
                    setResponsibleNameCharsLeft(40 - length);
                  }}
                  className={`w-full px-3 py-2 border ${responsibleNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required={!hasParents}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {responsibleNameCharsLeft} caracteres restantes (Máximo 40)
                </p>
                {responsibleNameError && <p className="text-xs text-red-500 mt-1">{responsibleNameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula del Encargado Legal *
                </label>
                <input
                  type="text"
                  value={(form as unknown as Record<string, unknown>).legal_guardian_cedula as string || ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setForm(prev => ({
                      ...prev,
                      legal_guardian_cedula: digits
                    }));
                    // No mostrar error para longitudes intermedias
                    setResponsibleCedulaError('');
                    setResponsibleCedulaCharsLeft(12 - digits.length);
                  }}
                  className={`w-full px-3 py-2 border ${responsibleCedulaError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required={!hasParents}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {responsibleCedulaCharsLeft} caracteres restantes (Máximo 12)
                </p>
                {responsibleCedulaError && <p className="text-xs text-red-500 mt-1">{responsibleCedulaError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del Encargado Legal
                </label>
                <input
                  type="text"
                  value={form.legal_guardian_phone || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    // Verificar si hay caracteres no numéricos (excepto el guion permitido)
                    if (/[^\d-]/.test(rawValue)) {
                      setResponsiblePhoneError('Solo se permiten números.');
                      return;
                    }
                    const digits = rawValue.replace(/\D/g, '').slice(0, 8);
                    let formatted = digits;
                    if (digits.length > 4) {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                    }
                    if (formatted.length > 9) return;

                    setResponsiblePhoneError('');
                    setForm(prev => ({
                      ...prev,
                      legal_guardian_phone: formatted
                    }));
                    setResponsiblePhoneCharsLeft(9 - formatted.length);
                  }}
                  className={`w-full px-3 py-2 border ${responsiblePhoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {responsiblePhoneCharsLeft} caracteres restantes (Máximo 9, formato: 8888-8888)
                </p>
                {responsiblePhoneError && <p className="text-xs text-red-500 mt-1">{responsiblePhoneError}</p>}
              </div>
            </div>
          )}
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
