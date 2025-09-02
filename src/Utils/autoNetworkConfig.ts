// Configuración automática de red - NO REQUIERE CONFIGURACIÓN MANUAL
export class AutoNetworkConfig {
  private static instance: AutoNetworkConfig;
  private backendIP: string | null = null;
  private isDetecting = false;

  private constructor() {}

  static getInstance(): AutoNetworkConfig {
    if (!AutoNetworkConfig.instance) {
      AutoNetworkConfig.instance = new AutoNetworkConfig();
    }
    return AutoNetworkConfig.instance;
  }

  // Detectar automáticamente la IP del backend
  async detectBackendIP(): Promise<string> {
    if (this.backendIP) {
      return this.backendIP;
    }

    if (this.isDetecting) {
      // Esperar a que termine la detección
      while (this.isDetecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.backendIP || 'localhost';
    }

    this.isDetecting = true;

    try {
      // Método 1: Intentar con localhost primero
      if (await this.testConnection('http://localhost:3000')) {
        this.backendIP = 'localhost';
        console.log('✅ Backend detectado en localhost:3000');
        return this.backendIP;
      }

      // Método 2: Detectar IPs locales y probar conexión
      const localIPs = await this.getLocalIPs();
      console.log('🔍 IPs locales detectadas:', localIPs);

      for (const ip of localIPs) {
        const url = `http://${ip}:3000`;
        console.log(`🔍 Probando conexión a: ${url}`);
        
        if (await this.testConnection(url)) {
          this.backendIP = ip;
          console.log(`✅ Backend detectado automáticamente en: ${url}`);
          return this.backendIP;
        }
      }

      // Método 3: Probar IPs comunes de red local
      const commonIPs = [
        '192.168.1.100',
        '192.168.1.101',
        '192.168.1.102',
        '192.168.0.100',
        '192.168.0.101',
        '10.0.0.100',
        '10.0.0.101'
      ];

      for (const ip of commonIPs) {
        const url = `http://${ip}:3000`;
        console.log(`🔍 Probando IP común: ${url}`);
        
        if (await this.testConnection(url)) {
          this.backendIP = ip;
          console.log(`✅ Backend detectado en IP común: ${url}`);
          return this.backendIP;
        }
      }

      // Método 4: Fallback a localhost
      console.log('⚠️ No se pudo detectar el backend, usando localhost');
      this.backendIP = 'localhost';
      return this.backendIP;

    } catch (error) {
      console.error('❌ Error detectando backend:', error);
      this.backendIP = 'localhost';
      return this.backendIP;
    } finally {
      this.isDetecting = false;
    }
  }

  // Obtener todas las IPs locales
  private async getLocalIPs(): Promise<string[]> {
    try {
      // Usar WebRTC para detectar IPs locales
      const ips: string[] = [];
      
      // Crear un RTCPeerConnection para detectar IPs
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Crear un canal de datos para forzar la detección
      pc.createDataChannel('');

      return new Promise((resolve) => {
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const ip = event.candidate.candidate.split(' ')[4];
            if (ip && this.isLocalIP(ip)) {
              ips.push(ip);
            }
          } else {
            // Terminó la detección
            pc.close();
            resolve([...new Set(ips)]); // Eliminar duplicados
          }
        };

        // Crear una oferta para iniciar la detección
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
      });

    } catch (error) {
      console.log('⚠️ WebRTC no disponible, usando IPs comunes');
      // Fallback: IPs comunes en redes locales
      return [
        '192.168.1.1',
        '192.168.0.1',
        '10.0.0.1',
        '172.16.0.1'
      ];
    }
  }

  // Verificar si una IP es local
  private isLocalIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    const first = parseInt(parts[0]);
    const second = parseInt(parts[1]);
    
    return (
      (first === 192 && second === 168) || // 192.168.x.x
      (first === 10) ||                    // 10.x.x.x
      (first === 172 && second >= 16 && second <= 31) || // 172.16-31.x.x
      (first === 127) ||                    // 127.x.x.x (localhost)
      (first === 169 && second === 254)    // 169.254.x.x (link-local)
    );
  }

  // Probar conexión a una URL
  private async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // Evitar problemas de CORS
      });

      clearTimeout(timeoutId);
      console.log(`✅ Conexión exitosa a: ${url}`);
      return true;
    } catch (error) {
      console.log(`❌ Error conectando a: ${url}`, error);
      return false;
    }
  }

  // Obtener URL del backend
  async getBackendUrl(): Promise<string> {
    const ip = await this.detectBackendIP();
    return `http://${ip}:3000`;
  }

  // Obtener URL del frontend
  getFrontendUrl(): string {
    const hostname = window.location.hostname;
    const port = window.location.port;
    return `http://${hostname}:${port}`;
  }

  // Forzar nueva detección
  async refreshDetection(): Promise<string> {
    this.backendIP = null;
    return await this.detectBackendIP();
  }
}

// Instancia global
export const autoNetwork = AutoNetworkConfig.getInstance();
