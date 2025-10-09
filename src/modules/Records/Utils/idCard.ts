export type AttendanceQrPayload = {
  type: 'attendance';
  record_id: number;
  user_id?: number | null;
  full_name?: string;
  issued_at: string; // ISO string
  nonce: string;
};

export function createNonce(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

export function buildAttendanceQrData(params: {
  recordId: number;
  userId?: number | null;
  fullName?: string;
}): string {
  const payload: AttendanceQrPayload = {
    type: 'attendance',
    record_id: params.recordId,
    user_id: params.userId ?? null,
    full_name: params.fullName,
    issued_at: new Date().toISOString(),
    nonce: createNonce(10),
  };

  // For now, plain JSON. Later we can sign/JWT this and switch scanners seamlessly.
  return JSON.stringify(payload);
}


