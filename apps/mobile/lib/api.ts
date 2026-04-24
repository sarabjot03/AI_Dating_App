import { getEnv } from '@/lib/env';
import { getAccessToken } from '@/lib/secure-token';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = await response.text();
  }
  throw new ApiError(`Request failed: ${response.status}`, response.status, body);
}

function buildUrl(path: string): string {
  const { EXPO_PUBLIC_API_URL } = getEnv();
  const base = EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}/v1${suffix}`;
}

/** Unauthenticated requests (OTP, refresh). */
export async function publicApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { EXPO_PUBLIC_APP_ENV } = getEnv();
  const url = buildUrl(path);
  if (EXPO_PUBLIC_APP_ENV === 'production' && !url.startsWith('https://')) {
    throw new Error('Refusing non-HTTPS API URL in production');
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });
  await throwIfNotOk(response);
  return response;
}

/** Adds Bearer access token when present. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { EXPO_PUBLIC_APP_ENV } = getEnv();
  const url = buildUrl(path);
  if (EXPO_PUBLIC_APP_ENV === 'production' && !url.startsWith('https://')) {
    throw new Error('Refusing non-HTTPS API URL in production');
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = await getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...init, headers });
  await throwIfNotOk(response);
  return response;
}
