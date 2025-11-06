import { authenticatedRequest } from '../../../shared/Services/api.service';

export interface UserActivity {
  id: string;
  title: string;
  type: 'workshop' | 'volunteer' | 'record' | 'attendance' | 'ticket';
  date: string;
  time?: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'open' | 'closed' | 'archived' | 'enrolled' | 'registered' | 'cancelled';
  description?: string;
}

export interface UserCalendarEvent {
  id: string;
  title: string;
  type: 'workshop' | 'volunteer' | 'attendance';
  date: string;
  time: string;
  location?: string;
  status: 'registered' | 'completed' | 'cancelled' | 'enrolled';
}

export interface UserStats {
  totalWorkshops: number;
  totalVolunteerActivities: number;
  totalRecords: number;
  upcomingEvents: number;
}

// Get user's recent activities
export const getUserActivities = async (limit: number = 5): Promise<UserActivity[]> => {
  try {
    const response = await authenticatedRequest(`/user/activities?limit=${limit}`);
    
        if (!response.ok) {
          throw new Error('Failed to fetch user activities');
        }
        
        return await response.json();
  } catch (error) {
    console.error('Error fetching user activities:', error);
    // Return mock data for now
    return [
      {
        id: '1',
        title: 'Taller de Programación Web',
        type: 'workshop',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'approved',
        description: 'Inscrito en taller de desarrollo web'
      },
      {
        id: '2',
        title: 'Voluntariado Comunitario',
        type: 'volunteer',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '14:00',
        status: 'pending',
        description: 'Registrado para voluntariado'
      },
      {
        id: '3',
        title: 'Expediente #12345',
        type: 'record',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        status: 'completed',
        description: 'Expediente procesado'
      }
    ];
  }
};

// Get user's calendar events (registered activities)
export const getUserCalendarEvents = async (): Promise<UserCalendarEvent[]> => {
  try {
    const response = await authenticatedRequest('/user/calendar');
    
        if (!response.ok) {
          throw new Error('Failed to fetch user calendar');
        }
        
        return await response.json();
  } catch (error) {
    console.error('Error fetching user calendar:', error);
    // Return mock data for now
    return [
      {
        id: '1',
        title: 'Taller de Programación Web',
        type: 'workshop',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        location: 'Sala de Conferencias A',
        status: 'registered'
      },
      {
        id: '2',
        title: 'Voluntariado Comunitario',
        type: 'volunteer',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '14:00',
        location: 'Centro Comunitario',
        status: 'registered'
      },
      {
        id: '3',
        title: 'Asistencia a Evento',
        type: 'attendance',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        time: '09:00',
        location: 'Auditorio Principal',
        status: 'registered'
      }
    ];
  }
};

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await authenticatedRequest('/user/stats');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return mock data for now
    return {
      totalWorkshops: 3,
      totalVolunteerActivities: 2,
      totalRecords: 1,
      upcomingEvents: 2
    };
  }
};

// Quick action handlers
export const quickActions = {
  createRecord: () => {
    // Navigate to record creation
    window.location.href = '/user/expedientes';
  },
  
  enrollWorkshop: () => {
    // Navigate to workshops
    window.location.href = '/user/talleres';
  },
  
  registerVolunteer: () => {
    // Navigate to volunteer registration
    window.location.href = '/user/voluntariado';
  }
};
