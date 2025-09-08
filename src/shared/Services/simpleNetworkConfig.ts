// Configuración simple de red para móvil
export class SimpleNetworkConfig {
  private static instance: SimpleNetworkConfig;
  private currentBackendUrl: string = '';
  private lastDetectionTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache

  private constructor() {}

  static getInstance(): SimpleNetworkConfig {
    if (!SimpleNetworkConfig.instance) {
      SimpleNetworkConfig.instance = new SimpleNetworkConfig();
    }
    return SimpleNetworkConfig.instance;
  }

  // Obtener la URL del backend de forma simple y optimizada
  async getBackendUrl(): Promise<string> {
    // Verificar cache primero
    if (this.currentBackendUrl && this.isCacheValid()) {
      return this.currentBackendUrl;
    }

    // Obtener la IP del host actual (desde donde se accede)
    const hostname = window.location.hostname;
    const port = '3000'; // Puerto del backend

    // Si estamos en localhost, probar IPs comunes en paralelo
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const commonIPs = [
        '192.168.1.100',
        '192.168.1.101', 
        '192.168.0.100',
        '192.168.0.101',
        '10.0.0.100',
        '10.0.0.101'
      ];

      console.log(`🔍 Probando conexiones en paralelo...`);
      
      // Probar todas las IPs en paralelo con timeout reducido
      const url = await this.testConnectionsInParallel(commonIPs, port);
      if (url) {
        this.currentBackendUrl = url;
        this.lastDetectionTime = Date.now();
        console.log(`✅ Backend encontrado en: ${url}`);
        return url;
      }
    }

    // Si no encontramos nada, usar la IP del host actual
    const url = `http://${hostname}:${port}`;
    console.log(`🌐 Usando IP del host actual: ${url}`);
    this.currentBackendUrl = url;
    this.lastDetectionTime = Date.now();
    return url;
  }

  // Probar conexiones en paralelo con timeout optimizado
  private async testConnectionsInParallel(ips: string[], port: string): Promise<string | null> {
    const timeout = 800; // Reducido de 2000ms a 800ms
    const promises = ips.map(async (ip) => {
      const url = `http://${ip}:${port}`;
      try {
        const isConnected = await this.testConnection(url, timeout);
        return isConnected ? url : null;
      } catch {
        return null;
      }
    });

    try {
      // Usar Promise.race para obtener la primera respuesta exitosa
      const results = await Promise.allSettled(promises);
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
      }
    } catch (error) {
      console.warn('⚠️ Error en pruebas paralelas:', error);
    }

    return null;
  }

  // Probar conexión simple con timeout personalizable
  private async testConnection(url: string, timeout: number = 800): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

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

  // Verificar si el cache es válido
  private isCacheValid(): boolean {
    return (Date.now() - this.lastDetectionTime) < this.CACHE_DURATION;
  }

  // Forzar nueva detección (limpia cache)
  async refreshDetection(): Promise<string> {
    console.log(`🔄 Forzando nueva detección...`);
    this.currentBackendUrl = '';
    this.lastDetectionTime = 0;
    return await this.getBackendUrl();
  }

  // Configurar URL manualmente
  setBackendUrl(url: string): void {
    this.currentBackendUrl = url;
    this.lastDetectionTime = Date.now();
    console.log(`🔧 Backend URL configurada manualmente: ${url}`);
  }

  // Obtener URL actual sin detección
  getCurrentUrl(): string {
    return this.currentBackendUrl || 'http://localhost:3000';
  }
}

// Instancia global
export const simpleNetwork = SimpleNetworkConfig.getInstance();
