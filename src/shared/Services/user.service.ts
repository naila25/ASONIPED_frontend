import { authenticatedRequest } from './api.service';

export interface MeResponse {
  id: number;
  username?: string;
  name: string;
  email?: string;
  phone?: string | null;
}

export interface UpdateProfilePayload {
  name: string;
  email?: string;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function getCurrentUser(): Promise<MeResponse> {
  const res = await authenticatedRequest('/users/me', { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<{ message: string }> {
  const res = await authenticatedRequest('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const res = await authenticatedRequest('/users/me/password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to change password');
  return res.json();
}


