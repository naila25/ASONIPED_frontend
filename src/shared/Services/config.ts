import { simpleNetwork } from './simpleNetworkConfig';

// Obtener VITE_BACKEND_URL al inicio (se inyecta durante el build en Vercel)
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Configuración centralizada para las URLs del backend
export const BACKEND_CONFIG = {
  // Para desarrollo local
  LOCAL: 'http://localhost:3000',
  
  // Detectar automáticamente el entorno (con cache)
  getCurrentUrl: async () => {
    try {
      // PRIORIDAD 1: En producción, usar variable de entorno VITE_BACKEND_URL
      if (VITE_BACKEND_URL) {
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
      return BACKEND_CONFIG.LOCAL;
    } catch {
      return BACKEND_CONFIG.LOCAL;
    }
  }
};

// URL base del API - inicializar con VITE_BACKEND_URL si está disponible
// Esto permite que API_BASE_URL (síncrono) funcione en producción
let _API_BASE_URL = VITE_BACKEND_URL || 'http://localhost:3000';
let _lastUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

if (VITE_BACKEND_URL) {
  _API_BASE_URL = VITE_BACKEND_URL;
}

// Función para obtener la URL del API con cache optimizado
export const getAPIBaseURL = async (): Promise<string> => {
  try {
    // PRIORIDAD 1: Si VITE_BACKEND_URL está disponible, usarlo inmediatamente (sin cache)
    // Re-verificar import.meta.env en caso de que se haya actualizado
    const currentViteUrl = import.meta.env.VITE_BACKEND_URL || VITE_BACKEND_URL;
    
    if (currentViteUrl) {
      if (_API_BASE_URL !== currentViteUrl) {
        _API_BASE_URL = currentViteUrl;
        _lastUpdate = Date.now();
      }
      return _API_BASE_URL;
    }
    
    // PRIORIDAD 2: Verificar cache solo si no estamos en producción
    const now = Date.now();
    if (now - _lastUpdate < CACHE_DURATION && _API_BASE_URL !== 'http://localhost:3000') {
      return _API_BASE_URL;
    }

    // PRIORIDAD 3: Detección automática (solo en desarrollo)
    _API_BASE_URL = await BACKEND_CONFIG.getCurrentUrl();
    _lastUpdate = now;
    return _API_BASE_URL;
  } catch {
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
      
    }
  }
  
  // Fallback to cached URL
  return _API_BASE_URL;
};

// Función para cambiar manualmente la URL del backend
export const setBackendUrl = (url: string) => {
  _API_BASE_URL = url;
  _lastUpdate = Date.now();
  simpleNetwork.setBackendUrl(url);
  return url;
};

// Función para forzar nueva detección automática
export const refreshBackendDetection = async () => {
  try {
    const newUrl = await simpleNetwork.refreshDetection();
    _API_BASE_URL = newUrl;
    _lastUpdate = Date.now();
    return _API_BASE_URL;
  } catch {
    return _API_BASE_URL;
  }
};
