import { apiFetch } from '@/lib/api';

export type ProfilePrompt = { question: string; answer: string };

export type MyProfile = {
  id: string;
  phoneE164: string;
  intent: string | null;
  city: string | null;
  energy: string | null;
  aboutLine: string | null;
  bio: string | null;
  prompts: ProfilePrompt[];
  onboardedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertMyProfileInput = {
  intent: string;
  city: string;
  energy: string;
  aboutLine: string;
  bio: string;
  prompts: ProfilePrompt[];
  onboarded?: boolean;
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
