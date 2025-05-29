// Utility functions for interacting with JsonBin for EventNewsItem CRUD
import type { EventNewsItem } from '../types/eventsNews';

const JSONBIN_API_KEY = '$2a$10$5iW5mNvCihHbi0EF9JWv1eEyj0krBYq5egcBGd1weGSAcJ3er/ATG';
const JSONBIN_BIN_ID = '683685968960c979a5a2024a';
const BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_API_KEY,
};

export async function getEventsNews(): Promise<EventNewsItem[]> {
  const res = await fetch(BASE_URL, { headers });
  const data = await res.json();
  return data.record || [];
}

export async function addEventNews(item: EventNewsItem): Promise<void> {
  const items = await getEventsNews();
  items.push(item);
  await fetch(BASE_URL, {
    method: 'PUT',
    headers,
    body: JSON.stringify(items),
  });
}

export async function updateEventNews(updatedItem: EventNewsItem): Promise<void> {
  const items = await getEventsNews();
  const newItems = items.map(item => item.id === updatedItem.id ? updatedItem : item);
  await fetch(BASE_URL, {
    method: 'PUT',
    headers,
    body: JSON.stringify(newItems),
  });
}

export async function deleteEventNews(id: string): Promise<void> {
  const items = await getEventsNews();
  const newItems = items.filter(item => item.id !== id);
  await fetch(BASE_URL, {
    method: 'PUT',
    headers,
    body: JSON.stringify(newItems),
  });
} 