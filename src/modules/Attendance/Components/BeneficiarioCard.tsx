import { FaUser, FaQrcode, FaEdit, FaTrash, FaCheckCircle, FaClock, FaIdCard } from 'react-icons/fa';
import type { BeneficiarioCardProps } from '../Types/attendanceNew';

export default function BeneficiarioCard({ record, onRemove, showActions = true }: BeneficiarioCardProps) {
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendanceTypeColor = () => {
    return record.attendance_type === 'beneficiario' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const getAttendanceTypeText = () => {
    return record.attendance_type === 'beneficiario' ? 'Beneficiario' : 'Invitado';
  };

  const getMethodIcon = () => {
    return record.attendance_method === 'qr_scan' ? FaQrcode : FaEdit;
  };

  const getMethodColor = () => {
    return record.attendance_method === 'qr_scan' 
      ? 'text-green-600' 
      : 'text-orange-600';
  };

  const getMethodText = () => {
    return record.attendance_method === 'qr_scan' ? 'QR Escaneado' : 'Registro Manual';
  };

  const handleRemove = () => {
    if (onRemove && record.id) {
      onRemove(record.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className={`p-2 rounded-lg ${
            record.attendance_type === 'beneficiario' 
              ? 'bg-blue-100' 
              : 'bg-purple-100'
          }`}>
            <FaUser className={`w-5 h-5 ${
              record.attendance_type === 'beneficiario' 
                ? 'text-blue-600' 
                : 'text-purple-600'
            }`} />
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">
                {record.full_name}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAttendanceTypeColor()}`}>
                {getAttendanceTypeText()}
              </span>
            </div>

            {/* Record Number for Beneficiarios */}
            {record.attendance_type === 'beneficiario' && record.record_number && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                <FaIdCard className="w-3 h-3" />
                <span>Expediente: {record.record_number}</span>
              </div>
            )}

            {/* Cedula */}
            {record.cedula && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Cédula:</span> {record.cedula}
              </div>
            )}

            {/* Phone */}
            {record.phone && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Teléfono:</span> {record.phone}
              </div>
            )}

            {/* Activity Info */}
            {record.activity_track_name && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Actividad:</span> {record.activity_track_name}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FaClock className="w-3 h-3" />
              <span>
                {record.scanned_at 
                  ? `Registrado: ${formatTime(record.scanned_at)}`
                  : `Creado: ${formatTime(record.created_at)}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Method and Actions */}
        <div className="flex items-center gap-3">
          {/* Method Indicator */}
          <div className="flex items-center gap-1">
            {(() => {
              const MethodIcon = getMethodIcon();
              return (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  record.attendance_method === 'qr_scan' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  <MethodIcon className={`w-3 h-3 ${getMethodColor()}`} />
                  <span>{getMethodText()}</span>
                </div>
              );
            })()}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleRemove}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar registro"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <FaCheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Asistencia confirmada
          </span>
          {record.created_by_name && (
            <span className="text-sm text-gray-500 ml-auto">
              Registrado por: {record.created_by_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
