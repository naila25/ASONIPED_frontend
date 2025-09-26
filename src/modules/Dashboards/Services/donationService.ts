// donationService.ts actualizado con rutas correctas según tu backend

const API_BASE_URL_HEADER = 'http://localhost:3000/api/landing-donaciones-component';
const API_BASE_URL_CARDS = 'http://localhost:3000/api/landing-donaciones-card';

// Header (landing_donaciones_component)
export interface DonationHeader {
  id?: number;
  titulo: string;
  descripcion: string;
}

// Card (landing_donaciones_card)
export interface DonationsCard {
  id?: number;
  titulo_card: string;
  descripcion_card: string;
  URL_imagen: string;
  texto_boton: string;
  color_boton: string;
}

// Combinado para la sección completa (opcional si usas ambos endpoints)
export interface DonationSection {
  header: DonationHeader;
  cards: DonationsCard[];
}

export const donationService = {
  // Obtener header + cards juntos (opcional: si deseas obtener ambos a la vez)
  async getSection(): Promise<DonationSection> {
    const [header, cards] = await Promise.all([
      donationService.getHeader(),
      donationService.getCards()
    ]);
    return { header, cards };
  },

  // HEADER: Obtener el header actual (el primero de la lista)
  async getHeader(): Promise<DonationHeader> {
    const response = await fetch(`${API_BASE_URL_HEADER}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Donation header');
    }
    const data = await response.json();
    // Si hay varios, retornamos el primero
    return Array.isArray(data) ? data[0] : data;
  },

  // HEADER: Crear un nuevo header
  async createHeader(header: Omit<DonationHeader, 'id'>): Promise<{ message: string; id: number }> {
    const payload = {
      titulo: header.titulo,
      descripcion: header.descripcion
    };
    const response = await fetch(`${API_BASE_URL_HEADER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create Donation header');
    }
    return response.json();
  },

  // HEADER: Editar header por id
  async updateHeader(header: DonationHeader): Promise<{ message: string }> {
    if (!header.id) throw new Error('Se requiere el id del header para actualizar');
    const payload = {
      titulo: header.titulo,
      descripcion: header.descripcion
    };
    const response = await fetch(`${API_BASE_URL_HEADER}/${header.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update Donation header');
    }
    return response.json();
  },

  // CARDS: Obtener todas las cards
  async getCards(): Promise<DonationsCard[]> {
    const response = await fetch(`${API_BASE_URL_CARDS}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Donation cards');
    }
    return response.json();
  },

  // CARDS: Obtener una card por id
  async getCardById(id: number): Promise<DonationsCard> {
    const response = await fetch(`${API_BASE_URL_CARDS}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Donation card');
    }
    return response.json();
  },

  // CARDS: Crear una nueva card
  async createCard(card: Omit<DonationsCard, 'id'>): Promise<{ message: string; id: number }> {
    const payload = {
      titulo_card: card.titulo_card,
      descripcion_card: card.descripcion_card,
      URL_imagen: card.URL_imagen,
      texto_boton: card.texto_boton,
      color_boton: card.color_boton
    };
    const response = await fetch(`${API_BASE_URL_CARDS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create Donation card');
    }
    return response.json();
  },

  // CARDS: Editar una card
  async updateCard(id: number, card: Partial<DonationsCard>): Promise<{ message: string }> {
    const payload = {
      titulo_card: card.titulo_card || '',
      descripcion_card: card.descripcion_card || '',
      URL_imagen: card.URL_imagen || '',
      texto_boton: card.texto_boton || '',
      color_boton: card.color_boton || ''
    };
    const response = await fetch(`${API_BASE_URL_CARDS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update Donation card');
    }
    return response.json();
  },

  // CARDS: Eliminar una card
  async deleteCard(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL_CARDS}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete Donation card');
    }
    return response.json();
  }
};