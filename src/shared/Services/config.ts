import { simpleNetwork } from './simpleNetworkConfig';

// Obtener VITE_BACKEND_URL al inicio (se inyecta durante el build en Vercel)
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Debug: Log environment variable status
if (typeof window !== 'undefined') {
  console.log('🔍 Environment Debug:', {
    VITE_BACKEND_URL: VITE_BACKEND_URL || 'NOT SET',
    NODE_ENV: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
}

// Configuración centralizada para las URLs del backend
export const BACKEND_CONFIG = {
  // Para desarrollo local
  LOCAL: 'http://localhost:3000',
  
  // Detectar automáticamente el entorno (con cache)
  getCurrentUrl: async () => {
    try {
      // PRIORIDAD 1: En producción, usar variable de entorno VITE_BACKEND_URL
      if (VITE_BACKEND_URL) {
        console.log('🌐 Usando VITE_BACKEND_URL:', VITE_BACKEND_URL);
        return VITE_BACKEND_URL;
      }

      // PRIORIDAD 2: En desarrollo, usar detección automática
      if (import.meta.env.DEV) {
        // Usar cache si está disponible
        const cachedUrl = simpleNetwork.getCurrentUrl();
        if (cachedUrl && cachedUrl !== 'http://localhost:3000') {
          return cachedUrl;
        }

        // Detección automática del backend solo si es necesario
        const backendUrl = await simpleNetwork.getBackendUrl();
        return backendUrl;
      }

      // PRIORIDAD 3: Fallback a localhost si no hay configuración
      console.warn('⚠️ No se encontró VITE_BACKEND_URL, usando localhost');
      return BACKEND_CONFIG.LOCAL;
    } catch (error) {
      console.warn('⚠️ Error en detección automática, usando localhost:', error);
      return BACKEND_CONFIG.LOCAL;
    }
  }
};

// URL base del API - inicializar con VITE_BACKEND_URL si está disponible
// Esto permite que API_BASE_URL (síncrono) funcione en producción
let _API_BASE_URL = VITE_BACKEND_URL || 'http://localhost:3000';
let _lastUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Logging para debug
if (VITE_BACKEND_URL) {
  console.log('✅ VITE_BACKEND_URL encontrado:', VITE_BACKEND_URL);
  _API_BASE_URL = VITE_BACKEND_URL;
} else {
  console.warn('⚠️ VITE_BACKEND_URL no está configurado. Usando localhost por defecto.');
  console.warn('⚠️ Para producción, configura VITE_BACKEND_URL en Vercel Environment Variables.');
}

// Función para obtener la URL del API con cache optimizado
export const getAPIBaseURL = async (): Promise<string> => {
  try {
    // PRIORIDAD 1: Si VITE_BACKEND_URL está disponible, usarlo inmediatamente (sin cache)
    // Re-verificar import.meta.env en caso de que se haya actualizado
    const currentViteUrl = import.meta.env.VITE_BACKEND_URL || VITE_BACKEND_URL;
    
    if (currentViteUrl) {
      console.log('✅ getAPIBaseURL: Usando VITE_BACKEND_URL:', currentViteUrl);
      if (_API_BASE_URL !== currentViteUrl) {
        _API_BASE_URL = currentViteUrl;
        _lastUpdate = Date.now();
      }
      return _API_BASE_URL;
    }
    
    console.warn('⚠️ getAPIBaseURL: VITE_BACKEND_URL no está disponible');

    // PRIORIDAD 2: Verificar cache solo si no estamos en producción
    const now = Date.now();
    if (now - _lastUpdate < CACHE_DURATION && _API_BASE_URL !== 'http://localhost:3000') {
      console.log(`🚀 Usando API URL cacheada: ${_API_BASE_URL}`);
      return _API_BASE_URL;
    }

    // PRIORIDAD 3: Detección automática (solo en desarrollo)
    _API_BASE_URL = await BACKEND_CONFIG.getCurrentUrl();
    _lastUpdate = now;
    return _API_BASE_URL;
  } catch {
    console.warn('⚠️ Usando URL por defecto:', _API_BASE_URL);
    return _API_BASE_URL;
  }
};

// Para compatibilidad con código existente
// Usar getter para que siempre devuelva el valor actualizado
export const API_BASE_URL = VITE_BACKEND_URL || _API_BASE_URL;

// Función helper para obtener API_BASE_URL actualizado (recomendado)
export const getAPIBaseURLSync = (): string => {
  // If VITE_BACKEND_URL is set, use it (highest priority)
  if (VITE_BACKEND_URL) {
    return VITE_BACKEND_URL;
  }
  
  // In browser environment, try to infer backend URL from current location
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    
    // If we're in production (not localhost), try to infer backend URL
    if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
      // In production, backend is typically on the same domain or a subdomain
      // Try common patterns: if frontend is on vercel, backend might be on railway/heroku/etc
      // For now, if _API_BASE_URL is not localhost, use it
      if (_API_BASE_URL && !_API_BASE_URL.includes('localhost')) {
        return _API_BASE_URL;
      }
      
      // If we can't determine, log a warning but return the cached value
      console.warn('⚠️ getAPIBaseURLSync: Could not determine production backend URL. Using cached value:', _API_BASE_URL);
    }
  }
  
  // Fallback to cached URL
  return _API_BASE_URL;
};

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
