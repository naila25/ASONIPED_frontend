// Utility functions for interacting with JsonBin for EventNewsItem CRUD
import type { EventNewsItem } from '../Types/eventsNews';
import { getAuthHeader } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';

const getAPIUrl = () => `${getAPIBaseURLSync()}/events-news`;

export const fetchEventsNews = async () => {
  try {
    const response = await fetch(getAPIUrl(), {
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
    const response = await fetch(getAPIUrl(), {
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
    const response = await fetch(`${getAPIUrl()}/${id}`, {
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
  const res = await fetch(`${getAPIUrl()}/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to delete event/news');
}