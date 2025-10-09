import { getToken } from '../../Login/Services/auth';

const API_BASE_URL = 'http://localhost:3000';

// Register for a volunteer option
export const registerForVolunteer = async (volunteerOptionId: number, notes?: string): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/volunteer-registrations/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      volunteer_option_id: volunteerOptionId,
      notes: notes || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to register for volunteer option');
  }

  return response.json();
};

// Cancel volunteer registration
export const cancelVolunteerRegistration = async (volunteerOptionId: number): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/volunteer-registrations/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      volunteer_option_id: volunteerOptionId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to cancel volunteer registration');
  }

  return response.json();
};

// Get user's volunteer registrations
export const getUserRegistrations = async (): Promise<any[]> => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/volunteer-registrations/my-registrations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch user registrations');
  }

  return response.json();
};

// Get available spots for a volunteer option
export const getAvailableSpots = async (volunteerOptionId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/volunteer-registrations/available-spots/${volunteerOptionId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch available spots');
  }

  return response.json();
};
