import axios from 'axios';
import { getAuthHeader } from '../../../Utils/auth';

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
  const { data } = await axios.get('http://localhost:3000/enrollments', {
    headers: getAuthHeader()
  });
  return data;
};