import axios from 'axios';
import { getAuthHeader } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';

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
  const { data } = await axios.get(`${getAPIBaseURLSync()}/enrollments`, {
    headers: getAuthHeader()
  });
  return data;
};