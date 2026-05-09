import { apiFetch } from '@/lib/api';

export type ProfilePrompt = { question: string; answer: string };

export type MyProfile = {
  id: string;
  phoneE164: string;
  displayName: string | null;
  avatarDataUrl: string | null;
  intent: string | null;
  city: string | null;
  energy: string | null;
  aboutLine: string | null;
  bio: string | null;
  prompts: ProfilePrompt[];
  questionnaire?: { version?: string; responses: Record<string, unknown> } | null;
  onboardedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertMyProfileInput = {
  displayName: string;
  intent: string;
  city: string;
  energy: string;
  aboutLine: string;
  bio: string;
  prompts: ProfilePrompt[];
  questionnaire?: { version: string; responses: Record<string, unknown> };
  onboarded?: boolean;
  avatarDataUrl?: string | null;
};

export async function fetchMyProfile(): Promise<MyProfile> {
  const res = await apiFetch('/me/profile');
  return res.json();
}

export async function upsertMyProfile(payload: UpsertMyProfileInput): Promise<MyProfile> {
  const res = await apiFetch('/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function patchMyAvatar(avatarDataUrl: string | null): Promise<MyProfile> {
  const res = await apiFetch('/me/avatar', {
    method: 'PATCH',
    body: JSON.stringify({ avatarDataUrl }),
  });
  return res.json();
}
