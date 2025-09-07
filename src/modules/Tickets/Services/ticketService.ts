import { getToken } from '../../Login/Services/auth';
import { getAPIBaseURL } from '../../../shared/Services/config';

export interface DonationTicket {
  id: number;
  donation_id: number;
  user_id: number | null;
  status: 'open' | 'closed' | 'archived';
  created_at: string;
  closed_at: string | null;
  archived_at: string | null;
  assigned_admin_id: number | null;
  nombre?: string;
  correo?: string;
  asunto?: string;
  mensaje?: string; // Message content from donation
  user_name?: string;
  admin_name?: string;
  ticket_type: 'authenticated' | 'anonymous';
  ticket_id?: string; // For anonymous tickets
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

// API_BASE_URL will be obtained dynamically using getAPIBaseURL()

// Obtener todos los tickets (para admin)
export const getAllTickets = async (): Promise<DonationTicket[]> => {
  try {
    const token = getToken();
    const API_BASE_URL = await getAPIBaseURL();
    
    // Fetch both authenticated and anonymous tickets
    const [authResponse, anonResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/donation-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${API_BASE_URL}/anonymous-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    ]);

    if (!authResponse.ok || !anonResponse.ok) {
      throw new Error('Failed to fetch tickets');
    }

    const [authTickets, anonTickets] = await Promise.all([
      authResponse.json(),
      anonResponse.json()
    ]);

    // Transform anonymous tickets to match DonationTicket interface
    const transformedAnonTickets = anonTickets.map((ticket: any) => ({
      id: ticket.id,
      donation_id: ticket.donation_id,
      user_id: null, // Anonymous tickets don't have user_id
      status: ticket.status,
      created_at: ticket.created_at,
      closed_at: ticket.closed_at,
      archived_at: ticket.archived_at,
      assigned_admin_id: ticket.assigned_admin_id,
      nombre: ticket.nombre,
      correo: ticket.correo,
      asunto: ticket.asunto,
      user_name: null,
      admin_name: ticket.admin_name,
      ticket_type: 'anonymous' as const,
      ticket_id: ticket.ticket_id // Public ticket ID for anonymous tickets
    }));

    // Mark authenticated tickets
    const markedAuthTickets = authTickets.map((ticket: any) => ({
      ...ticket,
      ticket_type: 'authenticated' as const
    }));

    // Combine and sort by creation date
    return [...transformedAnonTickets, ...markedAuthTickets]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

// Obtener tickets de un usuario específico
export const getTicketsByUserId = async (userId: number): Promise<DonationTicket[]> => {
  try {
    const token = getToken();
    const API_BASE_URL = await getAPIBaseURL();
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
    const API_BASE_URL = await getAPIBaseURL();
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
    const API_BASE_URL = await getAPIBaseURL();
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

// Archivar un ticket
export const archiveTicket = async (ticketId: number): Promise<void> => {
  try {
    const token = getToken();
    const API_BASE_URL = await getAPIBaseURL();
    const response = await fetch(`${API_BASE_URL}/donation-tickets/${ticketId}/archive`, {
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
    console.error('Error archiving ticket:', error);
    throw error;
  }
};

// Obtener mensajes de un ticket
export const getTicketMessages = async (ticketId: number): Promise<TicketMessage[]> => {
  try {
    const token = getToken();
    const API_BASE_URL = await getAPIBaseURL();
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
    const API_BASE_URL = await getAPIBaseURL();
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
