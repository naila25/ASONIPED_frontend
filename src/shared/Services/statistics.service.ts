import { apiRequest, authenticatedRequest } from './api.service';

export interface Statistics {
  users: number;
  volunteers: number;
  workshops: number;
  beneficiaries: number;
  events: number;
  tickets: number;
}

export interface CalendarActivity {
  id: string;
  title: string;
  type: 'workshop' | 'volunteer' | 'event';
  date: string;
  time: string;
  location: string | null;
}

export const getStatistics = async (): Promise<Statistics> => {
  try {
    const response = await apiRequest('/users/statistics');
    
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    // Return default values if fetch fails
    return {
      users: 0,
      volunteers: 0,
      workshops: 0,
      beneficiaries: 0,
      events: 0,
      tickets: 0
    };
  }
};

// Get upcoming calendar activities (for admin dashboard home - limited)
export const getUpcomingCalendarActivities = async (limit: number = 10): Promise<CalendarActivity[]> => {
  try {
    const response = await authenticatedRequest(`/users/calendar-activities/upcoming?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming calendar activities');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming calendar activities:', error);
    return [];
  }
};

// Get calendar activities by month (for admin calendar page)
export const getCalendarActivitiesByMonth = async (year: number, month: number): Promise<CalendarActivity[]> => {
  try {
    const response = await authenticatedRequest(`/users/calendar-activities/month?year=${year}&month=${month}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar activities by month');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching calendar activities by month:', error);
    return [];
  }
};

export interface RecentActivity {
  id: string;
  title: string;
  type: 'expediente' | 'ticket' | 'taller' | 'voluntario';
  user?: string;
  workshop?: string;
  event?: string;
  time: string;
  timestamp: Date;
}

// Get recent activities (for admin dashboard home)
export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  try {
    const response = await authenticatedRequest(`/users/recent-activities?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recent activities');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};
