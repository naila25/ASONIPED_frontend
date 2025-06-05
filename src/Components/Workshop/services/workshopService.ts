import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { WorkshopEnrollment } from '../types/workshop';
import type { Workshop } from '../types/workshop';

const BACKEND_URL = 'http://localhost:3000'; // Change if your backend uses a different port

export const useAddEnrollment = () =>
  useMutation({
    mutationFn: async (data: WorkshopEnrollment) => {
      const response = await axios.post(`${BACKEND_URL}/enrollments`, data); 
      return response.data;
    },
  });

export const getAllWorkshops = async (): Promise<Workshop[]> => {
  const { data } = await axios.get(`${BACKEND_URL}/workshops`);
  return data;
};