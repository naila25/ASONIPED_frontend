import { getToken } from '../../Login/Services/auth';

const API_BASE_URL = 'http://localhost:3000/api/hero-section';

export interface HeroSection {
  id?: number;
  titulo: string;
  url_imagen?: string;
  descripcion: string;
  texto_boton_izquierdo: string;
  color_boton_izquierdo?: string;
  texto_boton_derecho: string;
  color_boton_derecho?: string;
}

interface HeroSectionBackend {
  id?: number;
  titulo: string;
  URL_imagen?: string;
  descripcion: string;
  texto_boton_izquierdo: string;
  color_boton_izquierdo?: string;
  texto_boton_derecho: string;
  color_boton_derecho?: string;
}

export const heroService = {
  // Get all hero sections
  async getAll(): Promise<HeroSection[]> {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error('Failed to fetch hero sections');
    }
    const data = await response.json();
    // Transform URL_imagen to url_imagen to match our interface
    return data.map((item: HeroSectionBackend) => ({
      ...item,
      url_imagen: item.URL_imagen
    }));
  },

  // Get single hero section by ID
  async getById(id: number): Promise<HeroSection> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch hero section');
    }
    const data = await response.json();
    // Transform URL_imagen to url_imagen to match our interface
    return {
      ...data,
      url_imagen: data.URL_imagen
    };
  },

  // Create new hero section
  async create(section: Omit<HeroSection, 'id'>): Promise<{ message: string; id: number }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Map frontend fields to backend field names
    const payload = {
      titulo: section.titulo,
      URL_imagen: section.url_imagen, // Backend expects URL_imagen
      descripcion: section.descripcion,
      texto_boton_izquierdo: section.texto_boton_izquierdo,
      color_boton_izquierdo: section.color_boton_izquierdo,
      texto_boton_derecho: section.texto_boton_derecho,
      color_boton_derecho: section.color_boton_derecho,
    };

    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create hero section');
    }
    return response.json();
  },

  // Update hero section
  async update(id: number, section: Partial<HeroSection>): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Map frontend fields to backend field names
    const payload = {
      titulo: section.titulo || '',
      URL_imagen: section.url_imagen, // Backend expects URL_imagen
      descripcion: section.descripcion || '',
      texto_boton_izquierdo: section.texto_boton_izquierdo || '',
      color_boton_izquierdo: section.color_boton_izquierdo,
      texto_boton_derecho: section.texto_boton_derecho || '',
      color_boton_derecho: section.color_boton_derecho,
    };

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update hero section');
    }
    return response.json();
  },

  // Delete hero section
  async delete(id: number): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete hero section');
    }
    return response.json();
  }
};