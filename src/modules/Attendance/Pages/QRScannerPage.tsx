import { useState, useEffect, useCallback } from 'react';
import { FaQrcode, FaUsers } from 'react-icons/fa';
import ActivitySelector from '../Components/ActivitySelector';
import AttendancePageHeader from '../Components/AttendancePageHeader';
import AttendanceEmptyState from '../Components/AttendanceEmptyState';
import QRScannerJSQR from '../Components/QRScannerJSQR';
import ScanningStatus from '../Components/ScanningStatus';
import BeneficiarioCard from '../Components/BeneficiarioCard';
import { attendanceRecordsApi, activityTracksApi } from '../Services/attendanceNewApi';
import type { ActivityTrack, AttendanceRecordWithDetails, QRScanData } from '../Types/attendanceNew';

export default function QRScannerPage() {
  const [selectedActivity, setSelectedActivity] = useState<ActivityTrack | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAttendanceRecords = useCallback(async () => {
    if (!selectedActivity) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await attendanceRecordsApi.getByActivityTrack(selectedActivity.id!, 1, 100);
      setAttendanceRecords(response.data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar registros de asistencia');
    } finally {
      setLoading(false);
    }
  }, [selectedActivity]);

  // Load attendance records when activity is selected
  useEffect(() => {
    if (selectedActivity) {
      // Defer data loading to improve initial render
      const timer = setTimeout(() => {
        loadAttendanceRecords();
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [selectedActivity, loadAttendanceRecords]);

  const handleActivitySelect = (activity: ActivityTrack) => {
    setSelectedActivity(activity);
    setError(null);
    setSuccess(null);
  };

  const handleQRScanSuccess = async (qrData: QRScanData) => {
    if (!selectedActivity) {
      setError('Por favor selecciona una actividad primero');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newRecord = await attendanceRecordsApi.processQRScan({
        qrData,
        activityTrackId: selectedActivity.id!
      });

      // Add the new record to the list
      setAttendanceRecords(prev => [newRecord, ...prev]);
      
      setSuccess(`Asistencia registrada: ${qrData.name}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
     } catch (err: unknown) {
      setError((err as Error).message || 'Error al procesar el código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanError = (error: string) => {
    setError(error);
  };

  const handleStartScanning = async () => {
    if (!selectedActivity) {
      setError('Por favor selecciona una actividad primero');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Start QR scanning on the backend
      await activityTracksApi.startScanning(selectedActivity.id!);
      
      setIsScanning(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al iniciar el escaneo QR');
    } finally {
      setLoading(false);
    }
  };

  const handleStopScanning = async () => {
    if (!selectedActivity) return;

    try {
      setLoading(true);
      
      // Stop QR scanning on the backend
      await activityTracksApi.stopScanning(selectedActivity.id!);
      
      setIsScanning(false);
    } catch {
      // Still stop scanning locally even if API call fails
      setIsScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const getBeneficiariosCount = () => {
    return attendanceRecords.filter(record => record.attendance_type === 'beneficiario').length;
  };

  const getGuestsCount = () => {
    return attendanceRecords.filter(record => record.attendance_type === 'guest').length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="emerald"
        icon={<FaQrcode className="h-6 w-6" />}
        title="Escaneo QR — Beneficiarios"
        description="Escanea el QR del expediente para registrar asistencia."
        actions={
          selectedActivity ? (
            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Actividad</p>
                <p className="max-w-[200px] truncate font-medium text-gray-900 lg:max-w-xs">
                  {selectedActivity.name}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-900">Activa</span>
              </div>
            </div>
          ) : null
        }
      />

      <div className="mx-auto max-w-8xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          {/* Left Column - Activity Selection */}
          <div className="lg:col-span-1">
            <ActivitySelector
              onActivitySelect={handleActivitySelect}
              selectedActivity={selectedActivity || undefined}
              showCreateButton={true}
              excludeParkingEnabled
              onCreateActivity={() => {
                window.location.href = '/admin/attendance/activities';
              }}
            />
          </div>

          {/* Right column — flujo principal */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            {/* Scanning Status */}
            {selectedActivity && (
               <ScanningStatus
                 isScanning={isScanning}
                 currentActivity={selectedActivity || undefined}
                 attendanceCount={attendanceRecords.length}
                 onStartScanning={handleStartScanning}
                 onStopScanning={handleStopScanning}
                 success={success}
                 error={error}
               />
            )}

            {/* QR Scanner */}
            {selectedActivity && (
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                <h2 className="mb-2 text-base font-semibold text-gray-900">Cámara</h2>
                 <QRScannerJSQR
                   onScanSuccess={handleQRScanSuccess}
                   onScanError={handleQRScanError}
                   isActive={isScanning}
                   activityTrack={selectedActivity || undefined}
                 />
              </div>
            )}


            {/* Instructions */}
            {!selectedActivity && (
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                <AttendanceEmptyState
                  className="border-0 shadow-none sm:p-4"
                  icon={<FaQrcode className="h-6 w-6" />}
                  title="Selecciona una actividad"
                  description="Elige una actividad a la izquierda para activar la cámara."
                />
              </div>
            )}

            {/* Attendance Records */}
            {selectedActivity && !loading && attendanceRecords.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                <AttendanceEmptyState
                  className="border-0 shadow-none sm:p-4"
                  icon={<FaUsers className="h-6 w-6" />}
                  title="Aún no hay registros"
                  description="Los escaneos válidos aparecerán aquí."
                />
              </div>
            )}

            {selectedActivity && attendanceRecords.length > 0 && (
              <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Asistencias</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <FaUsers className="h-4 w-4 text-emerald-600" />
                      <span className="text-gray-600">{getBeneficiariosCount()} beneficiarios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">{getGuestsCount()} invitados</span>
                    </div>
                  </div>
                </div>

                <div className="max-h-80 min-w-0 space-y-2 overflow-auto sm:max-h-96">
                  {attendanceRecords.map((record) => (
                    <BeneficiarioCard key={record.id} record={record} showActions={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  <span className="text-sm text-gray-600">Procesando…</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
