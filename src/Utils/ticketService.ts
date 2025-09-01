import { getToken } from './auth';

export interface DonationTicket {
  id: number;
  donation_id: number;
  user_id: number | null;
  status: 'open' | 'closed';
  created_at: string;
  closed_at: string | null;
  assigned_admin_id: number | null;
  nombre?: string;
  correo?: string;
  asunto?: string;
  user_name?: string;
  admin_name?: string;
}

export interface TicketMessage {
  id: number;
  module_type: 'donations' | 'records' | 'volunteers' | 'workshops';
  module_id: number;
  sender_id: number;
  message: string;
  timestamp: string;
  sender_name?: string;
}

const API_BASE_URL = 'http://localhost:3000';

// Obtener todos los tickets (para admin)
export const getAllTickets = async (): Promise<DonationTicket[]> => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/donation-tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

// Obtener tickets de un usuario específico
export const getTicketsByUserId = async (userId: number): Promise<DonationTicket[]> => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/donation-tickets/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user tickets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

// Obtener un ticket específico
export const getTicketById = async (ticketId: number): Promise<DonationTicket> => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/donation-tickets/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
};

// Cerrar un ticket
export const closeTicket = async (ticketId: number): Promise<void> => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/donation-tickets/${ticketId}/close`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to close ticket');
    }
  } catch (error) {
    console.error('Error closing ticket:', error);
    throw error;
  }
};

// Obtener mensajes de un ticket
export const getTicketMessages = async (ticketId: number): Promise<TicketMessage[]> => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ticket-messages/donation/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ticket messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    throw error;
  }
};

// Enviar un mensaje
export const sendMessage = async (messageData: {
  module_type: 'donations';
  module_id: number;
  sender_id: number;
  message: string;
}): Promise<void> => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ticket-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
