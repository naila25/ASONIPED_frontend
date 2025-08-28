import { autoNetwork } from './autoNetworkConfig';

// Configuración centralizada para las URLs del backend
export const BACKEND_CONFIG = {
  // Para desarrollo local
  LOCAL: 'http://localhost:3000',
  
  // Detectar automáticamente el entorno
  getCurrentUrl: async () => {
    try {
      // Detección automática del backend
      const backendUrl = await autoNetwork.getBackendUrl();
      console.log(`🌐 Backend detectado automáticamente: ${backendUrl}`);
      return backendUrl;
    } catch (error) {
      console.warn('⚠️ Error en detección automática, usando localhost:', error);
      return BACKEND_CONFIG.LOCAL;
    }
  }
};

// URL base del API - se actualiza automáticamente
let _API_BASE_URL = 'http://localhost:3000';

// Función para obtener la URL del API con detección automática
export const getAPIBaseURL = async (): Promise<string> => {
  try {
    _API_BASE_URL = await BACKEND_CONFIG.getCurrentUrl();
    return _API_BASE_URL;
  } catch (error) {
    console.warn('⚠️ Usando URL por defecto:', _API_BASE_URL);
    return _API_BASE_URL;
  }
};

// Para compatibilidad con código existente
export const API_BASE_URL = _API_BASE_URL;

// Función para cambiar manualmente la URL del backend (útil para debugging)
export const setBackendUrl = (url: string) => {
  _API_BASE_URL = url;
  console.log(`🔧 Backend URL cambiada manualmente a: ${url}`);
  return url;
};

// Función para forzar nueva detección automática
export const refreshBackendDetection = async () => {
  try {
    const newUrl = await autoNetwork.refreshDetection();
    _API_BASE_URL = `http://${newUrl}:3000`;
    console.log(`🔄 Nueva detección completada: ${_API_BASE_URL}`);
    return _API_BASE_URL;
  } catch (error) {
    console.error('❌ Error en nueva detección:', error);
    return _API_BASE_URL;
  }
};
