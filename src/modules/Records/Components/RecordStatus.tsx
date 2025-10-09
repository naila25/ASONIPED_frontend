import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { RecordWithDetails } from '../Types/records';

interface RecordStatusProps {
  record: RecordWithDetails;
}

const RecordStatus: React.FC<RecordStatusProps> = ({ record }) => {
  const getStatusInfo = () => {
    switch (record.status) {
      case 'draft':
        return { color: 'gray', icon: Clock, text: 'Borrador' };
      case 'pending':
        return { color: 'yellow', icon: Clock, text: 'Pendiente de Revisión' };
      case 'needs_modification':
        return { color: 'orange', icon: AlertCircle, text: 'Modificación requerida' };
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
          <p className="text-lg font-semibold text-gray-900">{record.record_number}</p>
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
              <span className="ml-2">{record.personal_data.cedula}</span>
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
                  {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordStatus;
