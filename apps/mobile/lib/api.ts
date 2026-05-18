import { getEnv } from '@/lib/env';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/lib/secure-token';

/** Render cold starts + Neon can exceed default RN timeouts (~60s). */
const FETCH_TIMEOUT_MS = 120_000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function isTransientNetworkFailure(e: unknown): boolean {
  if (e instanceof ApiError) return false;
  if (e instanceof TypeError) return true;
  if (e instanceof Error && e.name === 'AbortError') return true;
  return false;
}

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
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!headers.has('Content-Type') && init.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetchWithTimeout(url, { ...init, headers });
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
  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!headers.has('Content-Type') && init.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const doFetch = async (token: string | null): Promise<Response> => {
    const authHeaders = new Headers(headers);
    if (token) {
      authHeaders.set('Authorization', `Bearer ${token}`);
    } else {
      authHeaders.delete('Authorization');
    }
    return fetchWithTimeout(url, { ...init, headers: authHeaders });
  };

  const runOnce = async (): Promise<Response> => {
    let token = await getAccessToken();
    let response = await doFetch(token);

    if (response.status === 401) {
      const refresh = await getRefreshToken();
      if (refresh) {
        const refreshHeaders = new Headers({ 'Content-Type': 'application/json' });
        const refreshRes = await fetchWithTimeout(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: refreshHeaders,
          body: JSON.stringify({ refreshToken: refresh }),
        });
        if (refreshRes.ok) {
          const tokens = (await refreshRes.json()) as {
            accessToken: string;
            refreshToken: string;
          };
          await setAccessToken(tokens.accessToken);
          await setRefreshToken(tokens.refreshToken);
          token = tokens.accessToken;
          response = await doFetch(token);
        } else {
          await clearSession();
        }
      }
    }

    await throwIfNotOk(response);
    return response;
  };

  try {
    return await runOnce();
  } catch (e) {
    if (!isTransientNetworkFailure(e)) throw e;
    await sleep(4000);
    return await runOnce();
  }
}
