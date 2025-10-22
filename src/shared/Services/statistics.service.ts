import { apiRequest } from './api.service';

export interface Statistics {
  users: number;
  volunteers: number;
  workshops: number;
  beneficiaries: number;
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
      beneficiaries: 0
    };
  }
};
