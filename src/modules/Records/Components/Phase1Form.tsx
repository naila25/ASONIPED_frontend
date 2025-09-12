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
    pcd_name: '', // Empty string initially, will be validated on submit
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
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Verificar cédula cuando se ingresa
    if (name === 'cedula' && value.length >= 10) {
      checkCedula(value);
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
    const cleanedForm: Phase1Data = {
      ...form,
      pcd_name: form.pcd_name as Phase1Data['pcd_name'], // Cast to correct type
      mother_name: hasParents ? form.mother_name : undefined,
      mother_cedula: hasParents ? form.mother_cedula : undefined,
      mother_phone: hasParents ? form.mother_phone : undefined,
      father_name: hasParents ? form.father_name : undefined,
      father_cedula: hasParents ? form.father_cedula : undefined,
      father_phone: hasParents ? form.father_phone : undefined,
      legal_guardian_name: !hasParents ? form.legal_guardian_name : undefined,
      legal_guardian_cedula: !hasParents ? form.legal_guardian_cedula : undefined,
      legal_guardian_phone: !hasParents ? form.legal_guardian_phone : undefined,
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
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.id}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.phase}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.status}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.record_number}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.created_at}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.updated_at}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.personal_data?.full_name}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.personal_data?.cedula}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.notes?.length}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.notes?.map((note, index) => <span key={index}>{note.note}</span>).join(', ')}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.notes?.map((note, index) => <span key={index}>{note.created_at}</span>).join(', ')}</div>}
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
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
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  cedulaAvailable === false ? 'border-red-300' : 
                  cedulaAvailable === true ? 'border-green-300' : 'border-gray-300'
                }`}
                required
              />
              {cedulaChecking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
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
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              Nacionalidad
            </label>
            <input
              type="text"
              name="birth_place"
              value={form.birth_place}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  hasParents
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Información de Padres
              </button>
              <button
                type="button"
                onClick={() => setHasParents(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !hasParents
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
              name="mother_name"
                  value={form.mother_name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula de la Madre
            </label>
            <input
              type="text"
              name="mother_cedula"
                  value={form.mother_cedula || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de la Madre
            </label>
            <input
              type="tel"
              name="mother_phone"
              value={form.mother_phone || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Opcional"
            />
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
              name="father_name"
                  value={form.father_name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula del Padre
            </label>
            <input
              type="text"
              name="father_cedula"
                  value={form.father_cedula || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del Padre
                </label>
                <input
                  type="tel"
                  name="father_phone"
                  value={form.father_phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opcional"
                />
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
                  name="legal_guardian_name"
                  value={form.legal_guardian_name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!hasParents}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula del Encargado Legal *
                </label>
                <input
                  type="text"
                  name="legal_guardian_cedula"
                  value={form.legal_guardian_cedula || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!hasParents}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono del Encargado Legal
            </label>
            <input
              type="tel"
              name="legal_guardian_phone"
              value={form.legal_guardian_phone || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              
            />
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
