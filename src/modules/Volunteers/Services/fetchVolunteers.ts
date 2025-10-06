import type { Volunteer, VolunteerOption, VolunteerEnrollment, VolunteerProposal } from '../Types/volunteer';
import { getAuthHeader } from '../../Login/Services/auth';
import { API_BASE_URL } from '../../../shared/Services/config';

const API_URL = `${API_BASE_URL}/volunteers`;
const OPTIONS_API_URL = `${API_BASE_URL}/volunteer-options`;

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

// Enroll the current user into a volunteer option using account data
export const enrollIntoVolunteerOption = async (optionId: string | number): Promise<{ message: string; volunteerId: number }> => {
  const res = await fetch(`${API_URL}/enroll/${optionId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to enroll into volunteer option');
  return res.json();
};

// Get current user's volunteer enrollments
export const fetchMyVolunteerEnrollments = async (): Promise<{ enrollments: VolunteerEnrollment[] }> => {
  const res = await fetch(`${API_URL}/me`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch my enrollments');
  return res.json();
};

// ----- Proposals API -----
export const submitVolunteerProposal = async (formData: FormData): Promise<{ message: string }> => {
  const res = await fetch(`${OPTIONS_API_URL}/proposals`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      // Let browser set multipart boundary
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to submit proposal');
  return res.json();
};

export const fetchMyVolunteerProposals = async (): Promise<{ proposals: VolunteerProposal[] }> => {
  const res = await fetch(`${OPTIONS_API_URL}/proposals/mine`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch my proposals');
  return res.json();
};

export const adminFetchAllProposals = async (): Promise<{ proposals: VolunteerProposal[] }> => {
  const res = await fetch(`${OPTIONS_API_URL}/proposals`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch proposals');
  return res.json();
};

export const adminSetProposalStatus = async (id: number, status: 'approved' | 'rejected' | 'filed', note?: string): Promise<{ message: string }> => {
  const res = await fetch(`${OPTIONS_API_URL}/proposals/${id}/status`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error('Failed to update proposal');
  return res.json();
};

// User: unenroll from a volunteer option
export const unenrollFromVolunteerOption = async (volunteerId: number): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/unenroll/${volunteerId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error('Failed to unenroll from volunteer option');
  return res.json();
};

// User: delete own proposal
export const deleteMyProposal = async (proposalId: number): Promise<{ message: string }> => {
  const res = await fetch(`${OPTIONS_API_URL}/proposals/${proposalId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error('Failed to delete proposal');
  return res.json();
};

// Fetch all available volunteer options
export const fetchVolunteerOptions = async (): Promise<VolunteerOption[]> => {
  const res = await fetch(OPTIONS_API_URL, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch volunteer options');
  return res.json();
};

// Add a new volunteer option (admin only)
export const addVolunteerOption = async (option: Omit<VolunteerOption, 'id'> & { imageFile?: File | null }): Promise<{ message: string }> => {
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
  formData.append('title', option.title);
  formData.append('description', option.description);
  formData.append('date', date);
  formData.append('location', option.location);
  if (option.skills) formData.append('skills', option.skills);
  if (option.tools) formData.append('tools', option.tools);
  if (option.imageUrl) formData.append('imageUrl', option.imageUrl);
  if (option.imageFile) formData.append('image', option.imageFile);
  
  // Add new fields
  if ((option as any).hour) formData.append('hour', (option as any).hour);
  if ((option as any).spots) formData.append('spots', String((option as any).spots));

  const res = await fetch(OPTIONS_API_URL, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add volunteer option');
  return res.json();
};

// Update a volunteer option (admin only)
export const updateVolunteerOption = async (id: number, option: Omit<VolunteerOption, 'id'> & { imageFile?: File | null }): Promise<{ message: string }> => {
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
  formData.append('title', option.title);
  formData.append('description', option.description);
  formData.append('date', date);
  formData.append('location', option.location);
  if (option.skills) formData.append('skills', option.skills);
  if (option.tools) formData.append('tools', option.tools);
  if (option.imageUrl) formData.append('imageUrl', option.imageUrl);
  if (option.imageFile) formData.append('image', option.imageFile);
  
  // Add new fields
  if ((option as any).hour) formData.append('hour', (option as any).hour);
  if ((option as any).spots) formData.append('spots', String((option as any).spots));

  const res = await fetch(`${OPTIONS_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
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