import { useState, useEffect, useCallback } from 'react';
import { FaQrcode, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import ActivitySelector from '../Components/ActivitySelector';
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

  console.log('QRScannerPage rendered', { selectedActivity, loading, error });

  const loadAttendanceRecords = useCallback(async () => {
    if (!selectedActivity) {
      console.log('No selected activity, skipping loadAttendanceRecords');
      return;
    }
    
    try {
      console.log('Loading attendance records for activity:', selectedActivity.id);
      setLoading(true);
      const response = await attendanceRecordsApi.getByActivityTrack(selectedActivity.id!, 1, 100);
      console.log('Attendance records loaded:', response);
      setAttendanceRecords(response.data);
    } catch (err) {
      console.error('Error loading attendance records:', err);
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
      console.error('Error processing QR scan:', err);
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
      console.log('✅ QR scanning started for activity:', selectedActivity.name);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al iniciar el escaneo QR');
      console.error('Error starting QR scanning:', err);
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
      console.log('⏹️ QR scanning stopped for activity:', selectedActivity.name);
    } catch (err: unknown) {
      console.error('Error stopping QR scanning:', err);
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/attendance"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaQrcode className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Escaneo QR - Beneficiarios</h1>
                  <p className="text-sm text-gray-600">Registra asistencia escaneando códigos QR</p>
                </div>
              </div>
            </div>
            
            {selectedActivity && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Actividad actual</p>
                  <p className="font-medium text-gray-900">{selectedActivity.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Activa</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Selection */}
          <div className="lg:col-span-1">
            <ActivitySelector
              onActivitySelect={handleActivitySelect}
              selectedActivity={selectedActivity || undefined}
              showCreateButton={true}
              onCreateActivity={() => {
                window.location.href = '/admin/attendance/activities';
              }}
            />
          </div>

          {/* Right Column - QR Scanner and Status */}
          <div className="lg:col-span-2 space-y-6">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Escáner de Códigos QR</h2>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <FaQrcode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una Actividad</h3>
                  <p className="text-gray-600">
                    Para comenzar a escanear códigos QR, primero selecciona una actividad en el panel izquierdo.
                  </p>
                </div>
              </div>
            )}

            {selectedActivity && !isScanning && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                  <FaQrcode className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Listo para Escanear</h3>
                  <p className="text-gray-600 mb-4">
                    Haz clic en "Iniciar Escaneo" para comenzar a registrar asistencia con códigos QR.
                  </p>
                  <button
                    onClick={handleStartScanning}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaQrcode className="w-4 h-4" />
                    Iniciar Escaneo
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Records */}
            {selectedActivity && attendanceRecords.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Registros de Asistencia</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUsers className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">{getBeneficiariosCount()} beneficiarios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">{getGuestsCount()} invitados</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendanceRecords.map((record) => (
                    <BeneficiarioCard
                      key={record.id}
                      record={record}
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Procesando...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
