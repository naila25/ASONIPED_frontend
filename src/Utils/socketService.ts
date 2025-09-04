import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Connect to Socket.io server with authentication
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = getToken();
        
        // Get backend URL from config
        const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        
        // Configure connection options
        const connectionOptions: any = {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          forceNew: true
        };

        // Add token if available (for authenticated users)
        if (token) {
          connectionOptions.auth = { token };
        }
        
        this.socket = io(backendURL, connectionOptions);

        this.socket.on('connect', () => {
          console.log('🔌 Connected to Socket.io server');
          console.log('🔌 Socket ID:', this.socket?.id);
          console.log('🔌 Backend URL:', backendURL);
          console.log('🔌 Connection type:', token ? 'Authenticated' : 'Anonymous');
          console.log('🔌 Socket instance:', this.socket);
          this.isConnected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.io connection error:', error);
          console.error('❌ Error details:', error.message);
          this.isConnected = false;
          
          // For anonymous users, don't reject on auth errors
          if (!token && error.message.includes('Authentication error')) {
            console.log('🔌 Anonymous user - continuing without authentication');
            this.isConnected = true;
            resolve();
          } else {
            reject(error);
          }
        });

        this.socket.on('disconnect', () => {
          console.log('🔌 Disconnected from Socket.io server');
          this.isConnected = false;
        });

        this.socket.on('reconnect', () => {
          console.log('🔌 Reconnected to Socket.io server');
          this.isConnected = true;
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Join a ticket room
   */
  joinTicketRoom(ticketId: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_ticket_room', ticketId);
    }
  }

  /**
   * Join an anonymous ticket room
   */
  joinAnonymousTicketRoom(ticketId: string): void {
    if (this.socket && this.isConnected) {
      console.log(`🎫 Joining anonymous ticket room: ${ticketId}`);
      console.log(`🎫 Socket status:`, { isConnected: this.isConnected, socketId: this.socket?.id });
      this.socket.emit('join_anonymous_ticket_room', ticketId);
    } else {
      console.warn(`⚠️ Cannot join room ${ticketId}: WebSocket not connected`);
      console.warn(`⚠️ Socket status:`, { isConnected: this.isConnected, socket: !!this.socket });
    }
  }

  /**
   * Leave a ticket room
   */
  leaveTicketRoom(ticketId: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_ticket_room', ticketId);
    }
  }

  /**
   * Leave an anonymous ticket room
   */
  leaveAnonymousTicketRoom(ticketId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_anonymous_ticket_room', ticketId);
    }
  }

  /**
   * Send a new message
   */
  sendMessage(ticketId: number, message: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('new_message', { ticketId, message });
    }
  }

  /**
   * Send a new anonymous message
   */
  sendAnonymousMessage(ticketId: string, message: any): void {
    if (this.socket && this.isConnected) {
      console.log('📡 Sending anonymous message via WebSocket:', { ticketId, message });
      this.socket.emit('new_anonymous_message', { ticketId, message });
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }



  /**
   * Listen for new messages
   */
  onMessageReceived(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('message_received', callback);
    }
  }

  /**
   * Listen for new anonymous messages
   */
  onAnonymousMessageReceived(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('anonymous_message_received', callback);
    }
  }



  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  /**
   * Remove specific listener
   */
  removeListener(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket !== null;
  }

  /**
   * Get socket instance for debugging
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
