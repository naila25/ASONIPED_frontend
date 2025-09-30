
import type { WorkshopOption } from '../Services/workshop';

const STORAGE_KEY = 'mock_workshop_options_v1';

// Simula latencia (opcional)
const delay = (ms = 250) => new Promise(res => setTimeout(res, ms));

function loadAll(): WorkshopOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkshopOption[];
  } catch {
    return [];
  }
}

function saveAll(list: WorkshopOption[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Generar ID (usa crypto.randomUUID si está disponible)
const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

// ----- API Mock -----

export async function fetchWorkshopOptions(): Promise<WorkshopOption[]> {
  await delay();
  return loadAll();
}

export async function addWorkshopOption(data: Omit<WorkshopOption, 'id'>): Promise<WorkshopOption> {
  await delay();
  const all = loadAll();
  const created: WorkshopOption = { ...data, id: genId() };
  all.push(created);
  saveAll(all);
  return created;
}

export async function updateWorkshopOption(id: string, data: Partial<WorkshopOption>): Promise<WorkshopOption> {
  await delay();
  const all = loadAll();
  const idx = all.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('No existe el taller');
  const updated = { ...all[idx], ...data };
  all[idx] = updated;
  saveAll(all);
  return updated;
}

export async function deleteWorkshopOption(id: string): Promise<{ message: string }> {
  await delay();
  const all = loadAll();
  const filtered = all.filter(o => o.id !== id);
  saveAll(filtered);
  return { message: 'Deleted' };
}

export function seedWorkshopsIfEmpty() {
  const existing = loadAll();
  if (existing.length === 0) {
    const seed: WorkshopOption[] = [
      {
        id: genId(),
        title: 'Taller de Escritura Creativa',
        description: 'Explora técnicas narrativas y estimula tu imaginación.',
        imageUrl: '',
        date: '2025-10-12',
        location: 'Sala 3',
        skills: 'Escritura básica',
        tools: 'Cuaderno, lápiz'
      },
      {
        id: genId(),
        title: 'Introducción a Música',
        description: 'Ritmo, melodía y expresión musical para principiantes.',
        imageUrl: '',
        date: '2025-11-04',
        location: 'Aula Música',
        skills: 'Ninguna',
        tools: 'Instrumento opcional'
      }
    ];
    saveAll(seed);
  }
}