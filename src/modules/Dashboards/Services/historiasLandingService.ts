import { getToken } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';
import type { TestimonialItem } from '../Types/types';

const baseComponent = () => getAPIBaseURLSync() + '/api/landing-historias-component';
const baseItem = () => getAPIBaseURLSync() + '/api/landing-historias-item';

export interface HistoriasHeader {
  id?: number;
  titulo: string;
  descripcion: string;
  color_titulo: string;
}

interface HistoriasItemRow {
  id: number;
  nombre: string;
  historia: string;
  video_url: string | null;
  orden: number;
}

function rowToTestimonial(row: HistoriasItemRow): TestimonialItem {
  return {
    id: String(row.id),
    name: row.nombre,
    description: row.historia,
    videoUrl: row.video_url || undefined,
    orden: row.orden,
  };
}

export const historiasLandingService = {
  async getHeader(): Promise<HistoriasHeader | null> {
    const response = await fetch(`${baseComponent()}/`);
    if (!response.ok) throw new Error('No se pudo cargar el encabezado de historias');
    const data = await response.json();
    const first = Array.isArray(data) ? data[0] : data;
    return first ?? null;
  },

  async createHeader(header: Omit<HistoriasHeader, 'id'>): Promise<{ message: string; id: number }> {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${baseComponent()}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(header),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al crear encabezado');
    return response.json();
  },

  async updateHeader(header: HistoriasHeader): Promise<{ message: string }> {
    if (!header.id) throw new Error('Se requiere id del encabezado');
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${baseComponent()}/${header.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(header),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al actualizar encabezado');
    return response.json();
  },

  async getItemsRaw(): Promise<HistoriasItemRow[]> {
    const response = await fetch(`${baseItem()}/`);
    if (!response.ok) throw new Error('No se pudieron cargar las historias');
    return response.json();
  },

  async getItems(): Promise<TestimonialItem[]> {
    const rows = await this.getItemsRaw();
    return rows.map(rowToTestimonial);
  },

  async getSection(): Promise<{ header: HistoriasHeader | null; items: TestimonialItem[] }> {
    const [header, items] = await Promise.all([
      this.getHeader().catch(() => null),
      this.getItems().catch(() => []),
    ]);
    return { header, items };
  },

  async createItem(item: {
    nombre: string;
    historia: string;
    video_url?: string | null;
    orden?: number;
  }): Promise<{ message: string; id: number }> {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${baseItem()}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al crear historia');
    return response.json();
  },

  async updateItem(
    id: number,
    item: { nombre: string; historia: string; video_url?: string | null; orden?: number }
  ): Promise<{ message: string }> {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${baseItem()}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al actualizar historia');
    return response.json();
  },

  async deleteItem(id: number): Promise<{ message: string }> {
    const token = getToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${baseItem()}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al eliminar historia');
    return response.json();
  },
};
