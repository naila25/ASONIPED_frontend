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

    // Health check disabled - usar directamente localhost o IP del host
    const url = `http://${hostname}:${port}`;
    this.currentBackendUrl = url;
    this.lastDetectionTime = Date.now();
    return url;
  }

  // Probar conexiones en paralelo con timeout optimizado
  private async testConnectionsInParallel(ips: string[], port: string): Promise<string | null> {
    const promises = ips.map(async (ip) => {
      const url = `http://${ip}:${port}`;
      try {
        const isConnected = await this.testConnection();
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
    } catch {
      // ignore parallel probe failures
    }

    return null;
  }

  // Probar conexión simple con timeout personalizable
  private async testConnection(): Promise<boolean> {
    // Health check disabled - return false to skip automatic detection
    return false;
  }

  // Verificar si el cache es válido
  private isCacheValid(): boolean {
    return (Date.now() - this.lastDetectionTime) < this.CACHE_DURATION;
  }

  // Forzar nueva detección (limpia cache)
  async refreshDetection(): Promise<string> {
    this.currentBackendUrl = '';
    this.lastDetectionTime = 0;
    return await this.getBackendUrl();
  }

  // Configurar URL manualmente
  setBackendUrl(url: string): void {
    this.currentBackendUrl = url;
    this.lastDetectionTime = Date.now();
  }

  // Obtener URL actual sin detección
  getCurrentUrl(): string {
    return this.currentBackendUrl || 'http://localhost:3000';
  }
}

// Instancia global
export const simpleNetwork = SimpleNetworkConfig.getInstance();
