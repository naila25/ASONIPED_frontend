import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getAPIBaseURL } from '../../Utils/config';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<{
    backendUrl: string;
    requestUrl: string;
    responseStatus?: number;
    errorDetails?: string;
  } | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      console.log('🔍 EmailVerification: Starting verification process');
      console.log('🔍 Token from URL:', token);
      
      if (!token) {
        console.log('❌ No token found in URL');
        setStatus('error');
        setMessage('Token de verificación no válido');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Getting backend URL...');
        let base: string;
        
        try {
          base = await getAPIBaseURL();
          console.log('✅ Backend URL detected:', base);
        } catch (urlError) {
          console.warn('⚠️ Failed to get backend URL, using fallback:', urlError);
          // Fallback to common localhost ports
          base = 'http://localhost:3000';
          console.log('🔄 Using fallback URL:', base);
        }
        
        const requestUrl = `${base}/users/verify-email`;
        const requestBody = { token };
        
        // Store debug info for UI display
        setDebugInfo({
          backendUrl: base,
          requestUrl: requestUrl
        });
        
        console.log('📤 Making request to:', requestUrl);
        console.log('📤 Request body:', requestBody);
        
        // Try the request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        // Update debug info with response status
        setDebugInfo(prev => prev ? { ...prev, responseStatus: response.status } : null);

        if (response.ok) {
          console.log('✅ Email verification successful');
          setStatus('success');
          setMessage('¡Tu email ha sido verificado exitosamente! Ahora puedes iniciar sesión.');
        } else {
          console.log('❌ Email verification failed with status:', response.status);
          try {
            const errorData = await response.json();
            console.log('❌ Error response body:', errorData);
            const errorMessage = errorData.error || errorData.message || `Error ${response.status}: Error al verificar el email`;
            setStatus('error');
            setMessage(errorMessage);
            
            // Store error details in debug info
            setDebugInfo(prev => prev ? { ...prev, errorDetails: errorMessage } : null);
          } catch (parseError) {
            console.log('❌ Could not parse error response:', parseError);
            const errorMessage = `Error ${response.status}: No se pudo procesar la respuesta del servidor`;
            setStatus('error');
            setMessage(errorMessage);
            
            // Store error details in debug info
            setDebugInfo(prev => prev ? { ...prev, errorDetails: errorMessage } : null);
          }
        }
      } catch (error) {
        console.error('❌ Network/connection error:', error);
        setStatus('error');
        setMessage(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, []);

  const handleGoToLogin = () => {
    navigate({ to: '/admin/login' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Verificando tu email...</h2>
          <p className="text-gray-400">Por favor, espera un momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
            {status === 'success' ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'success' ? '¡Verificación Exitosa!' : 'Error de Verificación'}
          </h1>
          
          <p className="text-gray-400">
            {status === 'success' 
              ? 'Tu cuenta ha sido activada correctamente' 
              : 'No se pudo verificar tu cuenta'
            }
          </p>
        </div>

        <div className={`p-6 rounded-lg border ${
          status === 'success' 
            ? 'bg-green-900/20 border-green-500/50 text-green-300' 
            : 'bg-red-900/20 border-red-500/50 text-red-300'
        }`}>
          <p className="text-center mb-6">{message}</p>
          
          {/* Debug Information - Show when there are errors or always in development */}
          {debugInfo && (import.meta.env.DEV || status === 'error') && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">🔍 Información de Debug:</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div><span className="text-gray-500">Backend URL:</span> {debugInfo.backendUrl}</div>
                <div><span className="text-gray-500">Request URL:</span> {debugInfo.requestUrl}</div>
                {debugInfo.responseStatus && (
                  <div><span className="text-gray-500">Response Status:</span> {debugInfo.responseStatus}</div>
                )}
                {debugInfo.errorDetails && (
                  <div><span className="text-gray-500">Error Details:</span> {debugInfo.errorDetails}</div>
                )}
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <button
              onClick={handleGoToLogin}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Ir al Login
            </button>
          )}
          
          {status === 'error' && (
            <div className="text-center">
              <button
                onClick={handleGoToLogin}
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 mr-3"
              >
                Ir al Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
              >
                Intentar Nuevamente
              </button>
              
              {/* Manual retry with different backend */}
              <button
                onClick={async () => {
                  setLoading(true);
                  setStatus('verifying');
                  setMessage('Reintentando con URL alternativa...');
                  
                  // Force refresh of backend detection
                  try {
                    const newBase = await getAPIBaseURL();
                    console.log('🔄 Retry with new backend URL:', newBase);
                    setDebugInfo(prev => prev ? { ...prev, backendUrl: newBase } : null);
                  } catch (error) {
                    console.log('🔄 Retry failed to get new URL:', error);
                  }
                  
                  // Reload after a short delay
                  setTimeout(() => window.location.reload(), 1000);
                }}
                className="block w-full mt-3 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
              >
                🔄 Reintentar con Detección de Backend
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            ¿Necesitas ayuda? Contacta con soporte técnico
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
