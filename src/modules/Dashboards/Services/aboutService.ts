import { getToken } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';

const getAPIBaseURL = () => getAPIBaseURLSync() + '/api/about-section';

export interface AboutSection {
  id?: number;
  titulo: string;
  URL_imagen: string;
  descripcion: string;
  texto_boton: string;
  color_boton: string;
}

export const aboutService = {
  async getAll(): Promise<AboutSection[]> {
    const response = await fetch(`${getAPIBaseURL()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch about sections');
    }
    return response.json();
  },

  async getById(id: number): Promise<AboutSection> {
    const response = await fetch(`${getAPIBaseURL()}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch about section');
    }
    return response.json();
  },

  async create(section: Omit<AboutSection, 'id'>): Promise<{ message: string; id: number }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getAPIBaseURL()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(section)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create AboutSection');
    }
    return response.json();
  },

  async update(id: number, section: Partial<AboutSection>): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getAPIBaseURL()}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(section)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update AboutSection');
    }
    return response.json();
  },

  async delete(id: number): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getAPIBaseURL()}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete AboutSection');
    }
    return response.json();
  }
};


