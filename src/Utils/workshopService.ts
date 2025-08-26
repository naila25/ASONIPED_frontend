import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { WorkshopEnrollment } from './workshop';
import type { Workshop } from './workshop';
import { getAuthHeader } from './auth';

import { API_BASE_URL } from './config';
const BACKEND_URL = API_BASE_URL; // Change if your backend uses a different port

export const getAllWorkshops = async (): Promise<Workshop[]> => {
  const { data } = await axios.get(`${BACKEND_URL}/workshops`);
  return data;
};

export const useAddEnrollment = () =>
  useMutation({
    mutationFn: async (data: WorkshopEnrollment) => {
      const response = await axios.post(`${BACKEND_URL}/enrollments`, data, {
        headers: getAuthHeader()
      }); 
      return response.data;
    },
  });