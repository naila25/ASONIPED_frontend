// Utility functions for interacting with JsonBin for EventNewsItem CRUD
import type { EventNewsItem } from '../types/eventsNews';

const BASE_URL = 'http://localhost:3000/events-news';

export async function getEventsNews(): Promise<EventNewsItem[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch events/news');
  return await res.json();
}

export async function addEventNews(item: EventNewsItem): Promise<void> {
  const token = sessionStorage.getItem('adminToken');
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to add event/news');
}

export async function updateEventNews(updatedItem: EventNewsItem): Promise<void> {
  const token = sessionStorage.getItem('adminToken');
  const res = await fetch(`${BASE_URL}/${updatedItem.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(updatedItem),
  });
  if (!res.ok) throw new Error('Failed to update event/news');
}

export async function deleteEventNews(id: string): Promise<void> {
  const token = sessionStorage.getItem('adminToken');
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });
  if (!res.ok) throw new Error('Failed to delete event/news');
} 