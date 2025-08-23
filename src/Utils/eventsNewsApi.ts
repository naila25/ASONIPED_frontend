// Utility functions for interacting with JsonBin for EventNewsItem CRUD
import type { EventNewsItem } from '../types/eventsNews';
import { getAuthHeader } from './auth.ts';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/events-news`;

export const fetchEventsNews = async () => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch events/news');
    return await response.json();
  } catch (error) {
    console.error('Error fetching events/news:', error);
    throw error;
  }
};

export const createEventNews = async (data: Omit<EventNewsItem, 'id'>) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create event/news');
    return await response.json();
  } catch (error) {
    console.error('Error creating event/news:', error);
    throw error;
  }
};

export const updateEventNews = async (id: number, data: Partial<EventNewsItem>) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update event/news');
    return await response.json();
  } catch (error) {
    console.error('Error updating event/news:', error);
    throw error;
  }
};

export async function deleteEventNews(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to delete event/news');
}