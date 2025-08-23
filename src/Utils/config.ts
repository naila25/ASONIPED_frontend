// Configuración centralizada para las URLs del backend
export const BACKEND_CONFIG = {
  // Para desarrollo local
  LOCAL: 'http://localhost:3000',
  // Para acceso desde móvil - reemplaza con tu IP local
  MOBILE: 'http://192.168.1.96:3000', // IP de tu computadora
  // URL actual basada en el entorno
  getCurrentUrl: () => {
    // Para acceso desde móvil, cambia LOCAL por MOBILE
    return BACKEND_CONFIG.MOBILE; // Cambia a LOCAL si quieres usar solo en localhost
  }
};

export const API_BASE_URL = BACKEND_CONFIG.getCurrentUrl();
