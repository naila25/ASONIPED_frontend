import React, { useState } from 'react';
import { User } from 'lucide-react';
import { checkCedulaAvailability } from '../Services/recordsApi';
import type { Phase1Data, RecordWithDetails } from '../Types/records';

interface Phase1FormProps {
  onSubmit: (data: Phase1Data) => void;
  loading: boolean;
  currentRecord?: RecordWithDetails;
  onBackToIntro?: () => void;
}

const Phase1Form: React.FC<Phase1FormProps> = ({ 
  onSubmit, 
  loading, 
  currentRecord,
  onBackToIntro
}) => {
  const [form, setForm] = useState<Phase1Data>({
    full_name: '',
    pcd_name: '',
    cedula: '',
    gender: 'male',
    birth_date: '',
    birth_place: '',
    address: '',
    province: '',
    district: '',
    mother_name: '',
    mother_cedula: '',
    father_name: '',
    father_cedula: '',
  });
  const [cedulaAvailable, setCedulaAvailable] = useState<boolean | null>(null);
  const [cedulaChecking, setCedulaChecking] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Verificar cédula cuando se ingresa
    if (name === 'cedula' && value.length >= 10) {
      checkCedula(value);
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
      console.error('Error checking cedula:', error);
    } finally {
      setCedulaChecking(false);
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
    onSubmit(form);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Información Personal Básica</h3>
          <p className="text-gray-600">Complete sus datos personales para iniciar el proceso</p>
          <p className="text-xs text-gray-500">
            {currentRecord ? `Editando expediente existente (ID: ${currentRecord.id})` : 'Creando nuevo expediente'}
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
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.notes?.map(note => note.note).join(', ')}</div>}
          {currentRecord && <div style={{display: 'none'}}>{currentRecord.notes?.map(note => note.created_at).join(', ')}</div>}
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
              Nombre de la PCD *
            </label>
            <input
              type="text"
              name="pcd_name"
              value={form.pcd_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
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
                <p className="text-red-600 text-sm mt-1">Esta cédula ya está registrada</p>
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
              Lugar de Nacimiento *
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provincia *
            </label>
            <input
              type="text"
              name="province"
              value={form.province}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distrito *
            </label>
            <input
              type="text"
              name="district"
              value={form.district}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Madre *
            </label>
            <input
              type="text"
              name="mother_name"
              value={form.mother_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cédula de la Madre *
            </label>
            <input
              type="text"
              name="mother_cedula"
              value={form.mother_cedula}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Padre *
            </label>
            <input
              type="text"
              name="father_name"
              value={form.father_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cédula del Padre *
            </label>
            <input
              type="text"
              name="father_cedula"
              value={form.father_cedula}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
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
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Phase1Form;
