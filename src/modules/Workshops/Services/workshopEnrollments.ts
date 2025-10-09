import { getToken } from '../../Login/Services/auth';

const API_BASE_URL = 'http://localhost:3000';

// Register for a workshop
export const registerForWorkshop = async (workshopId: number, notes?: string): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/workshop-enrollments/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      workshop_id: workshopId,
      notes: notes || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to enroll in workshop');
  }

  return response.json();
};

// Cancel workshop enrollment
export const cancelWorkshopEnrollment = async (workshopId: number): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/workshop-enrollments/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      workshop_id: workshopId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to cancel workshop enrollment');
  }

  return response.json();
};

// Get user's workshop enrollments
export const getUserEnrollments = async (): Promise<any[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/workshop-enrollments/my-enrollments`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch user enrollments');
  }

  return response.json();
};

// Get available spots for a workshop
export const getAvailableSpots = async (workshopId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/workshop-enrollments/available-spots/${workshopId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch available spots');
  }

  return response.json();
};
