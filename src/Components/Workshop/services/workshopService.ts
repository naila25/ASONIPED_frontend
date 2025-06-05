import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { WorkshopEnrollment } from '../types/workshop';

export const useAddEnrollment = () =>
  useMutation({
    mutationFn: async (data: WorkshopEnrollment) => {
      const response = await axios.post('/api/enrollments', data); 
      return response.data;
    },
  });
