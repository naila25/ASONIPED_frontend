import { FaPlay, FaStop, FaUsers, FaQrcode, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import type { ScanningStatusProps } from '../Types/attendanceNew';

export default function ScanningStatus({
  isScanning,
  currentActivity,
  attendanceCount,
  onStartScanning,
  onStopScanning,
  success,
  error
}: ScanningStatusProps) {
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  const getStatusColor = () => {
    return isScanning ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    return isScanning ? 'Escaneando' : 'Inactivo';
  };

  const getStatusIcon = () => {
    return isScanning ? (
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
    ) : (
      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaQrcode className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Estado del Escaneo</h2>
            <p className="text-sm text-gray-600">Controla el escaneo de códigos QR</p>
          </div>
        </div>
        
        {/* Alerts */}
        {(success || error) && (
          <div className="mt-4 space-y-3">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-800">{success}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Activity Information */}
      {currentActivity && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-2">{currentActivity.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              <span>
                {new Date(currentActivity.event_date).toLocaleDateString('es-ES')}
                {currentActivity.event_time && ` • ${formatTime(currentActivity.event_time)}`}
              </span>
            </div>
            {currentActivity.location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{currentActivity.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FaUsers className="w-4 h-4" />
              <span>{attendanceCount} asistentes registrados</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        {!isScanning ? (
          <button
            onClick={onStartScanning}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FaPlay className="w-4 h-4" />
            Iniciar Escaneo
          </button>
        ) : (
          <button
            onClick={onStopScanning}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <FaStop className="w-4 h-4" />
            Detener Escaneo
          </button>
        )}

        {/* Attendance Counter */}
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <FaCheckCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {attendanceCount} asistentes
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div className="text-sm text-blue-800">
            {isScanning ? (
              <p>
                <strong>Escaneo activo:</strong> Apunta la cámara hacia el código QR del beneficiario. 
                El sistema registrará automáticamente la asistencia cuando detecte un código válido.
              </p>
            ) : (
              <p>
                <strong>Listo para escanear:</strong> Haz clic en "Iniciar Escaneo" para comenzar 
                a registrar asistencia con códigos QR. Asegúrate de tener buena iluminación.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      {isScanning && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Escaneando códigos QR en tiempo real...</span>
        </div>
      )}
    </div>
  );
}
