import { getToken } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';

const getAPIBaseURL = () => getAPIBaseURLSync() + '/api/landing-volunteer';

export interface LandingVolunteer {
  id?: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  URL_imagen: string;
  texto_boton: string;
  color_boton: string;
}

export const volunteerLandingService = {
  async getAll(): Promise<LandingVolunteer[]> {
    const res = await fetch(`${getAPIBaseURL()}`);
    if (!res.ok) throw new Error('Failed to fetch volunteers');
    return res.json();
  },
  async getById(id: number): Promise<LandingVolunteer> {
    const res = await fetch(`${getAPIBaseURL()}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch volunteer');
    return res.json();
  },
  async create(payload: Omit<LandingVolunteer, 'id'>): Promise<{ message: string; id: number }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const res = await fetch(`${getAPIBaseURL()}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create volunteer');
    }
    return res.json();
  },
  async update(id: number, payload: Omit<LandingVolunteer, 'id'>): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const res = await fetch(`${getAPIBaseURL()}/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update volunteer');
    }
    return res.json();
  },
  async delete(id: number): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const res = await fetch(`${getAPIBaseURL()}/${id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete volunteer');
    return res.json();
  },
};




