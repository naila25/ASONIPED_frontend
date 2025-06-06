import type { Attendance } from '../types/attendance'; // Create this type if needed
import { getAuthHeader } from './auth';

const API_URL = 'http://localhost:3000/attendance';

export const fetchAttendance = async (): Promise<Attendance[]> => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      throw new Error('Failed to fetch attendance');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const createAttendance = async (data: Omit<Attendance, 'id' | 'created_at'>) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      throw new Error('Failed to create attendance record');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating attendance record:', error);
    throw error;
  }
};

// Alias for createAttendance to maintain compatibility
export const addAttendance = createAttendance;