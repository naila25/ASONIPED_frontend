import { getToken } from '../../Login/Services/auth';
import { getAPIBaseURL } from '../../../shared/Services/config';

export interface AnonymousTicket {
  id: number;
  ticket_id: string;
  donation_id: number;
  session_id: string | null;
  status: 'open' | 'closed' | 'archived';
  created_at: string;
  closed_at: string | null;
  archived_at: string | null;
  assigned_admin_id: number | null;
  nombre?: string;
  correo?: string;
  asunto?: string;
  mensaje?: string;
  admin_name?: string;
}

export interface AnonymousTicketMessage {
  id: number;
  ticket_id: number; // This is the numeric ID from the database
  sender_type: 'user' | 'admin';
  message: string;
  created_at: string;
}

export interface CreateAnonymousTicket {
  donation_id: number;
  session_id?: string;
}

export interface SendMessage {
  ticket_id: string;
  sender_type: 'user' | 'admin';
  message: string;
}

// Create a new anonymous ticket
export const createAnonymousTicket = async (ticketData: CreateAnonymousTicket): Promise<{ ticket_id: string; ticketId: number }> => {
  try {
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/api/anonymous-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      throw new Error('Failed to create anonymous ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating anonymous ticket:', error);
    throw error;
  }
};

// Get anonymous ticket by public ticket ID
export const getAnonymousTicketByTicketId = async (ticketId: string): Promise<AnonymousTicket> => {
  try {
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/anonymous-tickets/${ticketId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch anonymous ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching anonymous ticket:', error);
    throw error;
  }
};

// Get messages for an anonymous ticket
export const getAnonymousTicketMessages = async (ticketId: string): Promise<AnonymousTicketMessage[]> => {
  try {
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/anonymous-tickets/${ticketId}/messages`);

    if (!response.ok) {
      throw new Error('Failed to fetch ticket messages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    throw error;
  }
};

// Send a message for an anonymous ticket
export const sendAnonymousTicketMessage = async (messageData: SendMessage): Promise<void> => {
  try {
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/anonymous-tickets/${messageData.ticket_id}/messages`, {
      method: 'POST',
      headers: {
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

// Get all anonymous tickets (admin only)
export const getAllAnonymousTickets = async (): Promise<AnonymousTicket[]> => {
  try {
    const token = getToken();
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/anonymous-tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch anonymous tickets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching anonymous tickets:', error);
    throw error;
  }
};

// Close an anonymous ticket (admin only)
export const closeAnonymousTicket = async (ticketId: number): Promise<void> => {
  try {
    const token = getToken();
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/anonymous-tickets/${ticketId}/close`, {
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
    console.error('Error closing anonymous ticket:', error);
    throw error;
  }
};

// Archive an anonymous ticket (admin only)
export const archiveAnonymousTicket = async (ticketId: number): Promise<void> => {
  try {
    const token = getToken();
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/anonymous-tickets/${ticketId}/archive`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to archive ticket');
    }
  } catch (error) {
    console.error('Error archiving anonymous ticket:', error);
    throw error;
  }
};
