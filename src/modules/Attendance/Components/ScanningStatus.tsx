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
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      {(success || error) && (
        <div className="mb-2 space-y-2">
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-2.5 py-2">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="shrink-0 rounded-md bg-emerald-100 p-1.5 text-emerald-700">
            <FaQrcode className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight text-gray-900">Escaneo QR</h2>
            <p className="text-xs text-gray-500">Inicia o detén el registro por cámara</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isScanning ? (
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          ) : (
            <div className="h-2 w-2 rounded-full bg-gray-400" aria-hidden />
          )}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isScanning ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isScanning ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {currentActivity && (
        <div className="mb-2 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2">
          <p className="truncate text-sm font-medium text-gray-900">{currentActivity.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <FaClock className="h-3 w-3 shrink-0" />
              {new Date(currentActivity.event_date).toLocaleDateString('es-ES')}
              {currentActivity.event_time && ` · ${formatTime(currentActivity.event_time)}`}
            </span>
            {currentActivity.location && (
              <span className="inline-flex max-w-[14rem] items-center gap-1 truncate" title={currentActivity.location}>
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {currentActivity.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <FaUsers className="h-3 w-3 shrink-0" />
              {attendanceCount} registrados
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!isScanning ? (
          <button
            type="button"
            onClick={onStartScanning}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
          >
            <FaPlay className="h-3.5 w-3.5" />
            Iniciar escaneo
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopScanning}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
          >
            <FaStop className="h-3.5 w-3.5" />
            Detener
          </button>
        )}
        <p className="text-xs text-gray-500">
          {isScanning
            ? 'Apunta al QR del expediente; se registra al detectar un código válido.'
            : 'Pulsa Iniciar y asegura buena luz en el código.'}
        </p>
      </div>
    </div>
  );
}
