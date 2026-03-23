import type { Attendance } from '../Types/attendance'; 
import { getAuthHeader } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';

const API_URL = `${getAPIBaseURLSync()}/attendance`;

export const fetchAttendance = async (): Promise<Attendance[]> => {
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
};

export const createAttendance = async (data: Omit<Attendance, 'id' | 'created_at'>) => {
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
};

// Alias for createAttendance to maintain compatibility
export const addAttendance = createAttendance;