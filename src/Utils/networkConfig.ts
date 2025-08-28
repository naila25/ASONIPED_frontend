// Configuración de red para el proyecto
// CAMBIA ESTA IP POR LA IP DE TU COMPUTADORA EN TU RED LOCAL
export const NETWORK_CONFIG = {
  // IP de tu computadora en la red local
  // Para encontrar tu IP:
  // Windows: ipconfig
  // Mac/Linux: ifconfig o ip addr
  BACKEND_IP: '192.168.1.96', // ⚠️ CAMBIA ESTA IP
  
  // Puerto del backend
  BACKEND_PORT: 3000,
  
  // Puerto del frontend
  FRONTEND_PORT: 5173,
  
  // URLs completas
  getBackendUrl: () => `http://${NETWORK_CONFIG.BACKEND_IP}:${NETWORK_CONFIG.BACKEND_PORT}`,
  getFrontendUrl: () => `http://${NETWORK_CONFIG.BACKEND_IP}:${NETWORK_CONFIG.FRONTEND_PORT}`,
  
  // Función para cambiar la IP del backend en tiempo de ejecución
  setBackendIP: (newIP: string) => {
    NETWORK_CONFIG.BACKEND_IP = newIP;
    console.log(`✅ Backend IP cambiada a: ${newIP}`);
    console.log(`🔗 Backend URL: ${NETWORK_CONFIG.getBackendUrl()}`);
    return newIP;
  }
};

// Instrucciones para tu compañero:
console.log(`
🌐 CONFIGURACIÓN DE RED:
📱 Para usar desde móvil:
   1. Encuentra tu IP local: ipconfig (Windows) o ifconfig (Mac/Linux)
   2. Cambia BACKEND_IP en networkConfig.ts por tu IP
   3. Reinicia el frontend
   4. Accede desde móvil: ${NETWORK_CONFIG.getFrontendUrl()}

💻 Para desarrollo local:
   - Usa: http://localhost:${NETWORK_CONFIG.FRONTEND_PORT}
   - El backend se detectará automáticamente
`);
