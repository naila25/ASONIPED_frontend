// Configuración simple de red para móvil
export class SimpleNetworkConfig {
  private static instance: SimpleNetworkConfig;
  private currentBackendUrl: string = '';

  private constructor() {}

  static getInstance(): SimpleNetworkConfig {
    if (!SimpleNetworkConfig.instance) {
      SimpleNetworkConfig.instance = new SimpleNetworkConfig();
    }
    return SimpleNetworkConfig.instance;
  }

  // Obtener la URL del backend de forma simple
  async getBackendUrl(): Promise<string> {
    // Si ya tenemos una URL configurada, usarla
    if (this.currentBackendUrl) {
      return this.currentBackendUrl;
    }

    // Obtener la IP del host actual (desde donde se accede)
    const hostname = window.location.hostname;
    const port = '3000'; // Puerto del backend

    // Si estamos en localhost, probar IPs comunes
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const commonIPs = [
        '192.168.1.100',
        '192.168.1.101', 
        '192.168.0.100',
        '192.168.0.101',
        '10.0.0.100',
        '10.0.0.101'
      ];

      for (const ip of commonIPs) {
        const url = `http://${ip}:${port}`;
        console.log(`🔍 Probando conexión a: ${url}`);
        
        if (await this.testConnection(url)) {
          this.currentBackendUrl = url;
          console.log(`✅ Backend encontrado en: ${url}`);
          return url;
        }
      }
    }

    // Si no encontramos nada, usar la IP del host actual
    const url = `http://${hostname}:${port}`;
    console.log(`🌐 Usando IP del host actual: ${url}`);
    this.currentBackendUrl = url;
    return url;
  }

  // Probar conexión simple
  private async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }

  // Forzar nueva detección
  async refreshDetection(): Promise<string> {
    this.currentBackendUrl = '';
    return await this.getBackendUrl();
  }

  // Configurar URL manualmente
  setBackendUrl(url: string): void {
    this.currentBackendUrl = url;
    console.log(`🔧 Backend URL configurada manualmente: ${url}`);
  }
}

// Instancia global
export const simpleNetwork = SimpleNetworkConfig.getInstance();
