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
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getAttendanceTypeText = () => {
    return record.attendance_type === 'beneficiario' ? 'Beneficiario' : 'Invitado';
  };

  const getMethodIcon = () => {
    return record.attendance_method === 'qr_scan' ? FaQrcode : FaEdit;
  };

  const getMethodColor = () => {
    return record.attendance_method === 'qr_scan' ? 'text-emerald-600' : 'text-orange-600';
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
    <div className="min-w-0 w-full rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Avatar */}
          <div
            className={`rounded-lg p-2 ${
              record.attendance_type === 'beneficiario' ? 'bg-emerald-100' : 'bg-gray-100'
            }`}
          >
            <FaUser
              className={`h-5 w-5 ${
                record.attendance_type === 'beneficiario' ? 'text-emerald-600' : 'text-gray-600'
              }`}
            />
          </div>

          {/* Main Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 font-medium text-gray-900 break-words sm:truncate">
                {record.full_name}
              </h3>
              <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium ${getAttendanceTypeColor()}`}>
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
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
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
      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <FaCheckCircle className="h-4 w-4 shrink-0 text-green-500" />
          <span className="text-sm font-medium text-green-600">Asistencia confirmada</span>
          {record.created_by_name && (
            <span className="text-sm text-gray-500 sm:ml-auto">Registrado por: {record.created_by_name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
