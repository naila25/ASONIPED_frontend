const API_BASE_URL = 'http://localhost:3000/api/about-section';

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
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error('Failed to fetch about sections');
    }
    return response.json();
  },

  async getById(id: number): Promise<AboutSection> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch about section');
    }
    return response.json();
  },

  async create(section: Omit<AboutSection, 'id'>): Promise<{ message: string; id: number }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete AboutSection');
    }
    return response.json();
  }
};


