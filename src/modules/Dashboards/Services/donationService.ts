// ASONIPED_frontend/src/modules/Dashboards/Services/donationService.ts
const API_BASE_URL_HEADER = 'http://localhost:3000/api/landing-donaciones-component';
const API_BASE_URL_CARDS = 'http://localhost:3000/api/landing-donaciones-card';

export interface DonationHeader {
  id?: number;
  titulo: string;
  descripcion: string;
}
export interface DonationsCard {
  id?: number;
  titulo_card: string;
  descripcion_card: string;
  URL_imagen: string;
  texto_boton: string;
  color_boton: string;
}
export interface DonationSection {
  header: DonationHeader;
  cards: DonationsCard[];
}

export const donationService = {
  async getSection(): Promise<DonationSection> {
    const [header, cards] = await Promise.all([
      donationService.getHeader(),
      donationService.getCards()
    ]);
    return { header, cards };
  },

  // HEADER
  async getHeader(): Promise<DonationHeader> {
    const response = await fetch(`${API_BASE_URL_HEADER}`);
    if (!response.ok) throw new Error('Failed to fetch Donation header');
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  },

  async createHeader(header: Omit<DonationHeader, 'id'>): Promise<{ message: string; id: number }> {
    const response = await fetch(`${API_BASE_URL_HEADER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(header)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to create Donation header');
    return response.json();
  },

  async updateHeader(header: DonationHeader): Promise<{ message: string }> {
    if (!header.id) throw new Error('Se requiere el id del header para actualizar');
    const response = await fetch(`${API_BASE_URL_HEADER}/${header.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(header)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to update Donation header');
    return response.json();
  },

  // CARDS
  async getCards(): Promise<DonationsCard[]> {
    const response = await fetch(`${API_BASE_URL_CARDS}`);
    if (!response.ok) throw new Error('Failed to fetch Donation cards');
    return response.json();
  },

  async getCardById(id: number): Promise<DonationsCard> {
    const response = await fetch(`${API_BASE_URL_CARDS}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch Donation card');
    return response.json();
  },

  async createCard(card: Omit<DonationsCard, 'id'>, file?: File): Promise<{ message: string; id: number; URL_imagen?: string }> {
    const formData = new FormData();
    formData.append('titulo_card', card.titulo_card);
    formData.append('descripcion_card', card.descripcion_card);
    formData.append('texto_boton', card.texto_boton);
    formData.append('color_boton', card.color_boton);
    if (file) formData.append('imagen', file);

    const response = await fetch(`${API_BASE_URL_CARDS}`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to create Donation card');
    return response.json();
  },

  async updateCard(id: number, card: Partial<DonationsCard>, file?: File): Promise<{ message: string; URL_imagen?: string }> {
    const formData = new FormData();
    if (card.titulo_card) formData.append('titulo_card', card.titulo_card);
    if (card.descripcion_card) formData.append('descripcion_card', card.descripcion_card);
    if (card.texto_boton) formData.append('texto_boton', card.texto_boton);
    if (card.color_boton) formData.append('color_boton', card.color_boton);
    if (file) formData.append('imagen', file);
    if (card.URL_imagen && !file) formData.append('URL_imagen', card.URL_imagen);

    const response = await fetch(`${API_BASE_URL_CARDS}/${id}`, {
      method: 'PUT',
      body: formData
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to update Donation card');
    return response.json();
  },

  async deleteCard(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL_CARDS}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete Donation card');
    return response.json();
  }
};