const API_BASE_URL = 'http://localhost:3000/api/landing-donaciones';

// Tipos principales
export interface LandingDonationComponent {
  id?: number;
  titulo: string;
  descripcion: string;
}

export interface LandingDonationCard {
  id?: number;
  titulo_card: string;
  descripcion_card: string;
  URL_imagen: string;
  texto_boton: string;
  color_boton: string;
}

// Servicio para Donaciones
export const donationService = {
  // ===== COMPONENTE PRINCIPAL =====
  async getComponents(): Promise<LandingDonationComponent[]> {
    const response = await fetch(`${API_BASE_URL}/component`);
    if (!response.ok) {
      throw new Error('Failed to fetch donation components');
    }
    return response.json();
  },

  async getComponentById(id: number): Promise<LandingDonationComponent> {
    const response = await fetch(`${API_BASE_URL}/component/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch donation component');
    }
    return response.json();
  },

  async createComponent(component: Omit<LandingDonationComponent, 'id'>): Promise<{ message: string; id: number }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/component`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(component)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create donation component');
    }
    return response.json();
  },

  async updateComponent(id: number, component: Partial<LandingDonationComponent>): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/component/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(component)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update donation component');
    }
    return response.json();
  },

  async deleteComponent(id: number): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/component/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete donation component');
    }
    return response.json();
  },

  // ===== CARDS =====
  async getCards(): Promise<LandingDonationCard[]> {
    const response = await fetch(`${API_BASE_URL}/cards`);
    if (!response.ok) {
      throw new Error('Failed to fetch donation cards');
    }
    return response.json();
  },

  async getCardById(id: number): Promise<LandingDonationCard> {
    const response = await fetch(`${API_BASE_URL}/cards/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch donation card');
    }
    return response.json();
  },

  async createCard(card: Omit<LandingDonationCard, 'id'>): Promise<{ message: string; id: number }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(card)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create donation card');
    }
    return response.json();
  },

  async updateCard(id: number, card: Partial<LandingDonationCard>): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(card)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update donation card');
    }
    return response.json();
  },

  async deleteCard(id: number): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete donation card');
    }
    return response.json();
  }
};