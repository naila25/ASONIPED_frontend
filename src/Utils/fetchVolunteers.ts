import type { Volunteer, VolunteerOption } from '../types/volunteer';
import { getAuthHeader } from './auth';

const API_URL = 'http://localhost:3000/volunteers';
const OPTIONS_API_URL = 'http://localhost:3000/volunteer-options';

// Fetch a paginated list of volunteers (optionally filtered)
export const fetchVolunteers = async (page = 1, limit = 10, status?: string, name?: string): Promise<{ volunteers: Volunteer[]; total: number; page: number; limit: number }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append('status', status);
  if (name) params.append('name', name);

  const res = await fetch(`${API_URL}?${params.toString()}`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch volunteers');
  return res.json();
};

// Add a new volunteer
export const addVolunteer = async (volunteer: Volunteer) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(volunteer),
  });
  if (!res.ok) throw new Error('Failed to create volunteer');
  return res.json();
};

// Update an existing volunteer (admin only)
export const updateVolunteer = async (id: number, data: Partial<Volunteer>): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update volunteer');
  return res.json();
};

// Delete a volunteer (admin only)
export const deleteVolunteer = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete volunteer');
  return res.json();
};

// Fetch all available volunteer options
export const fetchVolunteerOptions = async (): Promise<VolunteerOption[]> => {
  const res = await fetch(OPTIONS_API_URL, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch volunteer options');
  return res.json();
};

// Add a new volunteer option (admin only)
export const addVolunteerOption = async (option: Omit<VolunteerOption, 'id'>): Promise<{ message: string }> => {
  const res = await fetch(OPTIONS_API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(option),
  });
  if (!res.ok) throw new Error('Failed to add volunteer option');
  return res.json();
};

// Update a volunteer option (admin only)
export const updateVolunteerOption = async (id: number, option: Omit<VolunteerOption, 'id'>): Promise<{ message: string }> => {
  const res = await fetch(`${OPTIONS_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(option),
  });
  if (!res.ok) throw new Error('Failed to update volunteer option');
  return res.json();
};

// Delete a volunteer option (admin only)
export const deleteVolunteerOption = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${OPTIONS_API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete volunteer option');
  return res.json();
};

// Fetch a paginated list of volunteer forms
export const fetchVolunteerForms = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${API_URL}?${params.toString()}`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch volunteer forms');
  return res.json();
};

// Add a new volunteer form
export const addVolunteerForm = async (form: Volunteer) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error('Failed to create volunteer form');
  return res.json();
};

// Update the status of a volunteer form
export const updateVolunteerFormStatus = async (id: number, status: 'pending' | 'approved' | 'rejected') => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update volunteer form status');
  return res.json();
};