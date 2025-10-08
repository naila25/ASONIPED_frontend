import type { Workshop, WorkshopOption } from '../Types/workshop';
import { getAuthHeader } from '../../Login/Services/auth';
import { API_BASE_URL } from '../../../shared/Services/config';

const API_URL = `${API_BASE_URL}/workshops`;
const OPTIONS_API_URL = `${API_BASE_URL}/workshops`;

// Fetch a paginated list of workshops (optionally filtered)
export const fetchWorkshops = async (
  page = 1,
  limit = 10,
  titulo?: string,
  ubicacion?: string
): Promise<{ workshops: Workshop[]; total: number; page: number; limit: number }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (titulo) params.append('titulo', titulo);
  if (ubicacion) params.append('ubicacion', ubicacion);

  const res = await fetch(`${API_URL}?${params.toString()}`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch workshops');
  return res.json();
};

// Add a new workshop
export const addWorkshop = async (workshop: Omit<Workshop, 'id'>) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workshop),
  });
  if (!res.ok) throw new Error('Failed to create workshop');
  return res.json();
};

// Update an existing workshop (admin only)
export const updateWorkshop = async (
  id: number,
  data: Partial<Workshop>
): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update workshop');
  return res.json();
};

// Delete a workshop (admin only)
export const deleteWorkshop = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete workshop');
  return res.json();
};

// Enroll the current user into a workshop option using account data
export const enrollIntoWorkshopOption = async (
  optionId: string | number
): Promise<{ message: string; enrollmentId: string }> => {
  const res = await fetch(`${API_URL}/enroll/${optionId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to enroll into workshop option');
  return res.json();
};

// Fetch all available workshop options
export const fetchWorkshopOptions = async (): Promise<WorkshopOption[]> => {
  const params = new URLSearchParams({ _t: String(Date.now()) }); // Cache busting
  const res = await fetch(`${OPTIONS_API_URL}?${params.toString()}`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch workshop options');
  return res.json();
};

// Add a new workshop option (admin only)
export const addWorkshopOption = async (
  option: Omit<WorkshopOption, 'id'> & { imageFile?: File | null }
): Promise<{ message: string }> => {
  const formData = new FormData();

  // Format date as DD/MM/YYYY if we received YYYY-MM-DD
  const date = (() => {
    const d = option.date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split('-');
      return `${day}/${m}/${y}`;
    }
    return d;
  })();

  // These properties must exist in WorkshopOption type!
  formData.append('title', option.title);
  formData.append('description', option.description);
  formData.append('date', date);
  formData.append('location', option.location);
  if (option.skills) formData.append('skills', option.skills);
  if (option.tools) formData.append('tools', option.tools);
  if (option.imageUrl) formData.append('imageUrl', option.imageUrl);
  if (option.imageFile) formData.append('image', option.imageFile);
  if ('time' in option && option.time) formData.append('time', option.time);
  if ('capacity' in option && option.capacity !== undefined)
    formData.append('capacity', String(option.capacity));

  const res = await fetch(OPTIONS_API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      // NO Content-Type for FormData!
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add workshop option');
  return res.json();
};

// Update a workshop option (admin only)
export const updateWorkshopOption = async (
  id: string,
  option: Omit<WorkshopOption, 'id'> & { imageFile?: File | null }
): Promise<{ message: string }> => {
  const formData = new FormData();

  const date = (() => {
    const d = option.date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split('-');
      return `${day}/${m}/${y}`;
    }
    return d;
  })();

  formData.append('title', option.title);
  formData.append('description', option.description);
  formData.append('date', date);
  formData.append('location', option.location);
  if (option.skills) formData.append('skills', option.skills);
  if (option.tools) formData.append('tools', option.tools);
  if (option.imageUrl) formData.append('imageUrl', option.imageUrl);
  if (option.imageFile) formData.append('image', option.imageFile);
  if ('time' in option && option.time) formData.append('time', option.time);
  if ('capacity' in option && option.capacity !== undefined)
    formData.append('capacity', String(option.capacity));

  const res = await fetch(`${OPTIONS_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      // NO Content-Type for FormData!
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update workshop option');
  return res.json();
};

// Delete a workshop option (admin only)
export const deleteWorkshopOption = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`${OPTIONS_API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete workshop option');
  return res.json();
};

// Fetch a paginated list of workshop enrollments (forms)
export const fetchWorkshopEnrollments = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    _t: String(Date.now()), // Cache busting
  });
  const res = await fetch(`${API_URL}/enrollments?${params.toString()}`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch workshop enrollments');
  return res.json();
};

// TODO: Add a new workshop enrollment
// TODO: Update the status of a workshop enrollment