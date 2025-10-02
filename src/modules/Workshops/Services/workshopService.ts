import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { Workshop } from './workshop';
import { getAuthHeader } from '../../Login/Services/auth';
import { API_BASE_URL } from '../../../shared/Services/config';

const BACKEND_URL = API_BASE_URL;

// Obtener todos los workshops (GET)
export const getAllWorkshops = async (): Promise<Workshop[]> => {
  const { data } = await axios.get(`${BACKEND_URL}/workshops`, {
    headers: getAuthHeader()
  });
  return data;
};

// Crear un nuevo workshop (POST)
export const createWorkshop = async (workshop: Omit<Workshop, 'id'>): Promise<Workshop> => {
  const { data } = await axios.post(`${BACKEND_URL}/workshops`, workshop, {
    headers: getAuthHeader()
  });
  return data;
};

// Si quieres usar React Query para crear workshops:
export const useCreateWorkshop = () =>
  useMutation({
    mutationFn: async (workshop: Omit<Workshop, 'id'>) => {
      const response = await axios.post(`${BACKEND_URL}/workshops`, workshop, {
        headers: getAuthHeader()
      });
      return response.data;
    },
  });