const API_BASE_URL = 'http://localhost:3000/workshops';

export interface LandingWorkshop {
  id?: number;
  titulo: string;
  titulo_card: string;
  descripcion_card: string;
  imagen_card: string;
  texto_boton_card: string;
  color_boton_card: string;
  fondo: string;
}

export const landingWorkshopService = {
  async getAll(): Promise<LandingWorkshop[]> {
    const res = await fetch(`${API_BASE_URL}`);
    if (!res.ok) throw new Error('Failed to fetch workshops');
    return res.json();
  },
  async getById(id: number): Promise<LandingWorkshop> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch workshop');
    return res.json();
  },
  async create(payload: Omit<LandingWorkshop, 'id'>): Promise<{ message: string; id: number }> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create workshop');
    }
    return res.json();
  },
  async update(id: number, payload: Omit<LandingWorkshop, 'id'>): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update workshop');
    }
    return res.json();
  },
  async delete(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete workshop');
    return res.json();
  },
};