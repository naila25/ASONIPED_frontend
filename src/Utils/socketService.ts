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
        if (!token) {
          reject(new Error('No authentication token available'));
          return;
        }

        // Get backend URL from config
        const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        
        this.socket = io(backendURL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          forceNew: true
        });

        this.socket.on('connect', () => {
          console.log('🔌 Connected to Socket.io server');
          console.log('🔌 Socket ID:', this.socket?.id);
          console.log('🔌 Backend URL:', backendURL);
          this.isConnected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.io connection error:', error);
          console.error('❌ Error details:', error.message);
          this.isConnected = false;
          reject(error);
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
   * Leave a ticket room
   */
  leaveTicketRoom(ticketId: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_ticket_room', ticketId);
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
   * Listen for new messages
   */
  onMessageReceived(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('message_received', callback);
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
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
