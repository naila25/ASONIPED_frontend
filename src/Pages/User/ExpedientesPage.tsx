import React, { useState, useEffect } from 'react';
import { FileText, User, CheckCircle, Clock, AlertCircle, Upload, Download, Eye } from 'lucide-react';
import { getUserRecord, createInitialRecord, completeRecord, checkCedulaAvailability } from '../../Utils/recordsApi';
import type { RecordWithDetails, Phase1Data, Phase3Data } from '../../types/records';

// Componente para mostrar el progreso del expediente
const ProgressIndicator = ({ currentPhase }: { currentPhase: string }) => {
  const phases = [
    { id: 'phase1', label: 'Registro Inicial', icon: User },
    { id: 'phase2', label: 'Revisión Admin', icon: Clock },
    { id: 'phase3', label: 'Formulario Completo', icon: FileText },
    { id: 'phase4', label: 'Revisión Final', icon: CheckCircle },
  ];

  const getPhaseStatus = (phaseId: string) => {
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    const currentIndex = phases.findIndex(p => p.id === currentPhase);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const Icon = phase.icon;
          
          return (
            <div key={phase.id} className="flex items-center">
              <div className={`flex flex-col items-center ${index > 0 ? 'ml-8' : ''}`}>
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2
                  ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${status === 'current' ? 'bg-blue-500 border-blue-500 text-white' : ''}
                  ${status === 'pending' ? 'bg-gray-200 border-gray-300 text-gray-500' : ''}
                `}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm mt-2 font-medium ${
                  status === 'completed' ? 'text-green-600' : 
                  status === 'current' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {phase.label}
                </span>
              </div>
              {index < phases.length - 1 && (
                <div className={`w-16 h-0.5 ml-4 ${
                  status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente para el formulario de Fase 1
const Phase1Form = ({ 
  onSubmit, 
  loading, 
  currentRecord 
}: { 
  onSubmit: (data: Phase1Data) => void; 
  loading: boolean;
  currentRecord?: RecordWithDetails;
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

        <div className="flex justify-end">
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

// Componente para mostrar el estado actual del expediente
const RecordStatus = ({ record }: { record: RecordWithDetails }) => {
  const getStatusInfo = () => {
    switch (record.status) {
      case 'draft':
        return { color: 'gray', icon: Clock, text: 'Borrador' };
      case 'pending':
        return { color: 'yellow', icon: Clock, text: 'Pendiente de Revisión' };
      case 'approved':
        return { color: 'green', icon: CheckCircle, text: 'Aprobado' };
      case 'rejected':
        return { color: 'red', icon: AlertCircle, text: 'Rechazado' };
      case 'active':
        return { color: 'green', icon: CheckCircle, text: 'Activo' };
      case 'inactive':
        return { color: 'gray', icon: AlertCircle, text: 'Inactivo' };
      default:
        return { color: 'gray', icon: Clock, text: 'Desconocido' };
    }
  };

  const getPhaseInfo = () => {
    switch (record.phase) {
      case 'phase1':
        return { text: 'Registro Inicial', description: 'Su solicitud inicial ha sido enviada y está siendo procesada.' };
      case 'phase2':
        return { text: 'Revisión Administrativa', description: 'Su solicitud está siendo revisada por el administrador.' };
      case 'phase3':
        return { text: 'Formulario Completo', description: 'Su solicitud inicial fue aprobada. Puede completar el formulario completo.' };
      case 'phase4':
        return { text: 'Revisión Final', description: 'Su expediente completo está siendo revisado para aprobación final.' };
      case 'completed':
        return { text: 'Expediente Completado', description: 'Su expediente ha sido aprobado y está activo.' };
      default:
        return { text: 'Fase Desconocida', description: 'Estado del expediente no determinado.' };
    }
  };

  const statusInfo = getStatusInfo();
  const phaseInfo = getPhaseInfo();
  const Icon = statusInfo.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${statusInfo.color}-100 rounded-lg`}>
            <Icon className={`w-6 h-6 text-${statusInfo.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado del Expediente</h3>
            <p className={`text-${statusInfo.color}-600 font-medium`}>{statusInfo.text}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Número de Expediente</p>
          <p className="font-mono text-lg font-semibold text-gray-900">{record.record_number}</p>
        </div>
      </div>

      {/* Información de la Fase Actual */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">Fase Actual: {phaseInfo.text}</h4>
        <p className="text-blue-800 text-sm">{phaseInfo.description}</p>
      </div>

      {record.personal_data && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Información Personal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nombre:</span>
              <span className="ml-2 font-medium">{record.personal_data.full_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Cédula:</span>
              <span className="ml-2 font-mono">{record.personal_data.cedula}</span>
            </div>
            <div>
              <span className="text-gray-600">Fecha de Creación:</span>
              <span className="ml-2">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Última Actualización:</span>
              <span className="ml-2">{record.updated_at ? new Date(record.updated_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {record.notes && record.notes.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-3">Comentarios del Administrador</h4>
          <div className="space-y-2">
            {record.notes.map((note, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{note.note}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal
const ExpedientesPage: React.FC = () => {
  const [record, setRecord] = useState<RecordWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserRecord();
  }, []);

  const loadUserRecord = async () => {
    try {
      setLoading(true);
      const userRecord = await getUserRecord();
      setRecord(userRecord);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando expediente');
    } finally {
      setLoading(false);
    }
  };

  const handlePhase1Submit = async (data: Phase1Data) => {
    try {
      setSubmitting(true);
      await createInitialRecord(data);
      // Recargar el expediente completo después de crearlo
      await loadUserRecord();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error enviando solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadUserRecord}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Expediente</h1>
            <p className="text-gray-600">Gestiona tu expediente de beneficiario de ASONIPED</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {record && <ProgressIndicator currentPhase={record.phase} />}

      {/* Content based on record status */}
      {!record ? (
        // No hay expediente - Mostrar formulario de Fase 1
        <Phase1Form onSubmit={handlePhase1Submit} loading={submitting} currentRecord={undefined} />
      ) : (
        // Hay expediente - Mostrar estado actual
        <RecordStatus record={record} />
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Información del Proceso</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Fase 1:</strong> Registro inicial con datos personales básicos</p>
          <p>• <strong>Fase 2:</strong> Revisión administrativa de la solicitud inicial</p>
          <p>• <strong>Fase 3:</strong> Completar formulario completo y subir documentos</p>
          <p>• <strong>Fase 4:</strong> Revisión final y aprobación del expediente</p>
        </div>
      </div>
    </div>
  );
};

export default ExpedientesPage;

