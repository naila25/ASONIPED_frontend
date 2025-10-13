import { useEffect, useRef, useState, useCallback } from 'react';
import { FaCamera, FaExclamationTriangle } from 'react-icons/fa';
import jsQR from 'jsqr';
import type { QRScannerProps, QRScanData } from '../Types/attendanceNew';

export default function QRScannerJSQR({ onScanSuccess, onScanError, isActive, activityTrack }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Prevent duplicate QR processing
  const lastProcessedQR = useRef<string>('');
  const processingRef = useRef<boolean>(false);
  
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not available:', {
          hasNavigator: !!navigator,
          hasMediaDevices: !!navigator.mediaDevices,
          hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
          userAgent: navigator.userAgent,
          isSecureContext: window.isSecureContext,
          protocol: window.location.protocol
        });
        throw new Error('Cámara no soportada en este dispositivo');
      }

      
      // Request camera permission with iOS Safari compatibility
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('🎥 Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;
      setCameraPermission('granted');

      if (videoRef.current) {
        // Add safety check to ensure element is still in DOM
        if (document.body.contains(videoRef.current)) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current && document.body.contains(videoRef.current)) {
              videoRef.current.play().then(() => {
                console.log('🎥 Video is ready and playing');
                setIsCameraReady(true);
                // Don't automatically set isScanning here - let the parent control it
                // The parent will call setIsScanning when it's ready to start scanning
              }).catch((playError) => {
                console.error('❌ Error playing video:', playError);
                setError('Error al reproducir el video de la cámara');
                setIsCameraReady(false);
              });
            }
          };
        }
      }

    } catch (err: unknown) {
      setCameraPermission('denied');
      
      console.error('❌ Camera error:', err);
      
      if ((err as Error).name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.');
      } else if ((err as Error).name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en este dispositivo.');
      } else if ((err as Error).name === 'NotSupportedError') {
        setError('La cámara no es compatible con este navegador. Intenta con Safari, Chrome o Firefox.');
      } else if ((err as Error).name === 'NotReadableError') {
        setError('La cámara está siendo usada por otra aplicación. Cierra otras apps que usen la cámara.');
      } else if ((err as Error).name === 'OverconstrainedError') {
        setError('Configuración de cámara no soportada. Intenta con configuración básica.');
      } else {
        setError('Error al acceder a la cámara: ' + (err as Error).message);
      }
      
      onScanError((err as Error).message);
    }
  }, [onScanError]);

  const stopCamera = useCallback(() => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clean up video element safely
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        if (videoRef.current.onloadedmetadata) {
          videoRef.current.onloadedmetadata = null;
        }
      }
      
      setIsScanning(false);
      setIsCameraReady(false);
      
      // Reset processing flags
      processingRef.current = false;
      lastProcessedQR.current = '';
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }, []);

  const scanForQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive || !isScanning) {
      return;
    }

    // Debounce scanning to prevent too many rapid scans
    const now = Date.now();
    if (now - lastScanTime < 1000) {
      // Continue scanning after a brief pause
      if (isScanning && isActive) {
        animationFrameRef.current = requestAnimationFrame(scanForQRCode);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
      return;
    }

    // Set canvas size to match video
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready yet, skipping scan');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data from canvas (only if dimensions are valid)
    if (canvas.width > 0 && canvas.height > 0) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR to decode QR code with options to reduce false positives
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert"
    });

    if (code && code.data && code.data.trim().length > 0) {
      // Prevent duplicate processing of the same QR code
      const currentQR = code.data;
      const now = Date.now();
      
      if (processingRef.current || 
          (lastProcessedQR.current === currentQR && (now - lastScanTime) < 2000)) {
        return;
      }
      
      try {
        processingRef.current = true;
        lastProcessedQR.current = currentQR;
        
        // Parse QR code content as JSON
        const parsedData = JSON.parse(code.data);
        
        // Handle Records module QR format:
        // { type: "attendance", record_id: 80, full_name: "John Doe", ... }
        let qrData: QRScanData | null = null;
        
        if (parsedData.record_id && parsedData.full_name && parsedData.type === 'attendance') {
          // Records module format
          qrData = {
            record_id: parsedData.record_id,
            name: parsedData.full_name
          };
        }
        
        if (qrData) {
          setLastScanTime(now);
          onScanSuccess(qrData);
          
          // Add visual feedback
          showScanSuccess();
          
          // Stop scanning briefly to prevent duplicate scans
          setIsScanning(false);
          setTimeout(() => {
            if (isActive) {
              setIsScanning(true);
            }
          }, 2000);
        }
      } catch {
        // Silently ignore parse errors
      } finally {
        // Reset processing flag after a delay
        setTimeout(() => {
          processingRef.current = false;
        }, 1000);
      }
    }
    } // Close the canvas dimension check

    // Continue scanning
    if (isScanning && isActive) {
      animationFrameRef.current = requestAnimationFrame(scanForQRCode);
    }
  }, [isActive, isScanning, onScanSuccess, lastScanTime]);

  const showScanSuccess = () => {
    // Add visual feedback for successful scan
    const video = videoRef.current;
    if (video) {
      video.style.border = '4px solid #10B981';
      setTimeout(() => {
        video.style.border = '4px solid #3B82F6';
      }, 500);
    }
  };

  const requestCameraPermission = async () => {
    try {
      await startCamera();
    } catch {
      // Silently handle error
    }
  };

  const testQRDetection = () => {
    // Test with a sample QR data
    const testData = {
      type: "attendance",
      record_id: 123,
      user_id: null,
      full_name: "Test Beneficiario",
      issued_at: new Date().toISOString(),
      nonce: "test123456"
    };
    
    const qrData = {
      record_id: testData.record_id,
      name: testData.full_name
    };
    
    onScanSuccess(qrData);
    showScanSuccess();
  };

  const testQRScanner = () => {
    // Test if the scanner is working by trying to scan the current video
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data && code.data.trim().length > 0) {
          // Test scan successful
        } else if (code && (!code.data || code.data.trim().length === 0)) {
          // QR detected but with empty data
        } else {
          // No QR code detected
        }
      }
    }
  };

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  // Start scanning when both camera is ready and parent wants to scan
  useEffect(() => {
    if (isActive && isCameraReady && !isScanning) {
      console.log('🎥 Camera is ready, starting QR scanning...');
      setIsScanning(true);
    } else if (!isActive || !isCameraReady) {
      setIsScanning(false);
    }
  }, [isActive, isCameraReady]);

  // Start scanning loop when isScanning becomes true
  useEffect(() => {
    if (isScanning && isActive && isCameraReady && videoRef.current && canvasRef.current) {
      scanForQRCode();
    }
  }, [isScanning, isActive, isCameraReady, scanForQRCode]);

  if (!isActive) {
    return (
      <div className="text-center py-8">
        <FaCamera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Cámara lista. Haz clic en "Iniciar Escaneo" para comenzar.</p>
      </div>
    );
  }

  if (cameraPermission === 'denied') {
    return (
      <div className="text-center py-8">
        <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso a Cámara Denegado</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={requestCameraPermission}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaCamera className="w-4 h-4" />
          Intentar Nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 md:h-80 object-cover"
          style={{ border: '4px solid #3B82F6' }}
          playsInline
          muted
        />
        
        {/* Hidden canvas for QR processing */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning Frame */}
              <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
              
              {/* Scanning Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"></div>
            </div>
          </div>
        )}
        
        {/* Status Indicator */}
        <div className="absolute top-4 left-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            isScanning 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {isScanning ? 'Escaneando...' : 'Inactivo'}
          </div>
        </div>
      </div>

      {/* Activity Info */}
      {activityTrack && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Actividad Actual</h4>
          <div className="text-sm text-gray-600">
            <p><strong>Nombre:</strong> {activityTrack.name}</p>
            <p><strong>Fecha:</strong> {new Date(activityTrack.event_date).toLocaleDateString('es-ES')}</p>
            {activityTrack.location && (
              <p><strong>Ubicación:</strong> {activityTrack.location}</p>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
