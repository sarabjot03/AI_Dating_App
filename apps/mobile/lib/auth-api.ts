import { apiFetch, publicApiFetch } from '@/lib/api';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
};

export async function sendOtp(phone10: string): Promise<{ ok: true; expiresInSeconds: number }> {
  const res = await publicApiFetch('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: phone10 }),
  });
  return res.json();
}

export async function verifyOtp(phone10: string, code: string): Promise<AuthTokens> {
  const res = await publicApiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: phone10, code }),
  });
  return res.json();
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const res = await publicApiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  return res.json();
}

export async function logoutRemote(refreshToken: string): Promise<void> {
  await publicApiFetch('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function fetchMe(): Promise<{ id: string; phoneE164: string; createdAt: string }> {
  const res = await apiFetch('/auth/me');
  return res.json();
}
