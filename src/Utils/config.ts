import { simpleNetwork } from './simpleNetworkConfig';

// Configuración centralizada para las URLs del backend
export const BACKEND_CONFIG = {
  // Para desarrollo local
  LOCAL: 'http://localhost:3000',
  
  // Detectar automáticamente el entorno (con cache)
  getCurrentUrl: async () => {
    try {
      // Usar cache si está disponible
      const cachedUrl = simpleNetwork.getCurrentUrl();
      if (cachedUrl && cachedUrl !== 'http://localhost:3000') {
        console.log(`🚀 Usando URL cacheada: ${cachedUrl}`);
        return cachedUrl;
      }

      // Detección automática del backend solo si es necesario
      const backendUrl = await simpleNetwork.getBackendUrl();
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
let _lastUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para obtener la URL del API con cache optimizado
export const getAPIBaseURL = async (): Promise<string> => {
  try {
    // Verificar si necesitamos actualizar la URL
    const now = Date.now();
    if (now - _lastUpdate < CACHE_DURATION && _API_BASE_URL !== 'http://localhost:3000') {
      console.log(`🚀 Usando API URL cacheada: ${_API_BASE_URL}`);
      return _API_BASE_URL;
    }

    _API_BASE_URL = await BACKEND_CONFIG.getCurrentUrl();
    _lastUpdate = now;
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
  _lastUpdate = Date.now();
  simpleNetwork.setBackendUrl(url);
  console.log(`🔧 Backend URL cambiada manualmente a: ${url}`);
  return url;
};

// Función para forzar nueva detección automática
export const refreshBackendDetection = async () => {
  try {
    const newUrl = await simpleNetwork.refreshDetection();
    _API_BASE_URL = newUrl;
    _lastUpdate = Date.now();
    console.log(`🔄 Nueva detección completada: ${_API_BASE_URL}`);
    return _API_BASE_URL;
  } catch (error) {
    console.error('❌ Error en nueva detección:', error);
    return _API_BASE_URL;
  }
};
