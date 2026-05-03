import { io, Socket } from 'socket.io-client';
import { getToken } from '../../modules/Login/Services/auth';
import { getAPIBaseURL } from './config';
import type { TicketMessage } from '../../modules/Tickets/Services/ticketService';
import type { SendMessage } from '../../modules/Tickets/Services/anonymousTicketService';

/** Outgoing payload for `new_message` (matches REST + optional socket fields). */
export type TicketSocketSendPayload = Pick<
  TicketMessage,
  'module_type' | 'module_id' | 'sender_id' | 'message'
> &
  Partial<Pick<TicketMessage, 'sender_name' | 'timestamp'>>;

/** Incoming `message_received` payloads (id/timestamp may arrive slightly after send). */
export type TicketSocketIncomingMessage = Pick<
  TicketMessage,
  'module_type' | 'module_id' | 'sender_id' | 'message'
> &
  Partial<Pick<TicketMessage, 'id' | 'timestamp' | 'sender_name'>>;

/** Incoming `anonymous_message_received` payloads. */
export interface AnonymousSocketIncomingMessage {
  sender_type: 'user' | 'admin';
  message: string;
  timestamp?: string;
  created_at?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Connect to Socket.io server with authentication
   */
  async connect(): Promise<void> {
    const token = getToken();
    const backendURL = await getAPIBaseURL();

    const connectionOptions: Record<string, unknown> = {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
    };

    if (token) {
      connectionOptions.auth = { token };
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(backendURL, connectionOptions);

        this.socket.on('connect', () => {
          this.isConnected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.isConnected = false;

          if (!token && error.message.includes('Authentication error')) {
            this.isConnected = true;
            resolve();
          } else {
            reject(error);
          }
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
        });

        this.socket.on('reconnect', () => {
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
      this.socket.emit('join_anonymous_ticket_room', ticketId);
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
  sendMessage(ticketId: number, message: TicketSocketSendPayload): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('new_message', { ticketId, message });
    }
  }

  /**
   * Send a new anonymous message
   */
  sendAnonymousMessage(ticketId: string, message: SendMessage): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('new_anonymous_message', { ticketId, message });
    }
  }



  /**
   * Listen for new messages
   */
  onMessageReceived(callback: (message: TicketSocketIncomingMessage) => void): void {
    if (this.socket) {
      this.socket.on('message_received', callback);
    }
  }

  /**
   * Listen for new anonymous messages
   */
  onAnonymousMessageReceived(callback: (message: AnonymousSocketIncomingMessage) => void): void {
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
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
