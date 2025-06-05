import type { Attendance } from '../types/attendance'; // Create this type if needed

const BASE_URL = 'http://localhost:3000/attendance';

export async function fetchAttendance(): Promise<Attendance[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return await res.json();
}

export async function addAttendance(record: Omit<Attendance, 'id' | 'created_at'>): Promise<void> {
  const token = sessionStorage.getItem('adminToken');
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Failed to add attendance');
}