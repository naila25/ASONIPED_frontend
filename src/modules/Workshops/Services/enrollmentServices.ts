import axios from 'axios';
import { getAuthHeader } from '../../Login/Services/auth';
import { API_BASE_URL } from '../../../shared/Services/config';

export interface WorkshopEnrollment {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  workshopId: string;
  created_at?: string;
}

export const getAllEnrollments = async (): Promise<WorkshopEnrollment[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/enrollments`, {
    headers: getAuthHeader()
  });
  return data;
};