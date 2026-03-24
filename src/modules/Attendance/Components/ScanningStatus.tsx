import { FaPlay, FaStop, FaUsers, FaQrcode, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import type { ScanningStatusProps } from '../Types/attendanceNew';

export default function ScanningStatus({
  isScanning,
  currentActivity,
  attendanceCount,
  onStartScanning,
  onStopScanning,
  success,
  error,
}: ScanningStatusProps) {
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      {(success || error) && (
        <div className="mb-4 space-y-3">
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
            <FaQrcode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Estado del escaneo</h2>
            <p className="text-sm text-gray-600">Controla el escaneo de códigos QR</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isScanning ? (
            <div className="h-3 w-3 animate-pulse rounded-full bg-teal-500" aria-hidden />
          ) : (
            <div className="h-3 w-3 rounded-full bg-gray-400" aria-hidden />
          )}
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              isScanning ? 'bg-teal-100 text-teal-900' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isScanning ? 'Escaneando' : 'Inactivo'}
          </span>
        </div>
      </div>

      {currentActivity && (
        <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <h3 className="mb-2 font-medium text-gray-900">{currentActivity.name}</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <FaClock className="h-4 w-4 shrink-0" />
              <span>
                {new Date(currentActivity.event_date).toLocaleDateString('es-ES')}
                {currentActivity.event_time && ` • ${formatTime(currentActivity.event_time)}`}
              </span>
            </div>
            {currentActivity.location && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{currentActivity.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FaUsers className="h-4 w-4 shrink-0" />
              <span>{attendanceCount} asistentes registrados</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {!isScanning ? (
          <button
            type="button"
            onClick={onStartScanning}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <FaPlay className="h-4 w-4" />
            Iniciar escaneo
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopScanning}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <FaStop className="h-4 w-4" />
            Detener escaneo
          </button>
        )}
        <div className="flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-4 py-2">
          <FaCheckCircle className="h-4 w-4 text-teal-600" />
          <span className="text-sm font-medium text-teal-900">{attendanceCount} asistentes</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50/80 p-3">
        <div className="flex items-start gap-2">
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-hidden />
          <div className="text-sm text-teal-900">
            {isScanning ? (
              <p>
                <strong>Escaneo activo:</strong> Apunta la cámara hacia el código QR del beneficiario. El sistema
                registrará automáticamente la asistencia cuando detecte un código válido.
              </p>
            ) : (
              <p>
                <strong>Listo para escanear:</strong> Haz clic en &quot;Iniciar escaneo&quot; para comenzar a registrar
                asistencia con códigos QR. Asegúrate de tener buena iluminación.
              </p>
            )}
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="mt-4 flex items-center gap-2 text-sm text-teal-700">
          <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500" aria-hidden />
          <span>Escaneando códigos QR en tiempo real…</span>
        </div>
      )}
    </div>
  );
}
