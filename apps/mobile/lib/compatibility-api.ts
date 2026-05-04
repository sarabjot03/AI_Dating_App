import { apiFetch } from '@/lib/api';

export type CompatibilitySectionPreview = {
  id: string;
  title: string;
  weight: number;
  score: number;
  answeredRatio: number;
};

export type CompatibilityPreview = {
  model: string;
  complete: boolean;
  overallScore: number | null;
  profileStrength: number | null;
  sections: CompatibilitySectionPreview[];
  disclaimer: string;
};

export async function fetchCompatibilityPreview(): Promise<CompatibilityPreview> {
  const res = await apiFetch('/me/compatibility-preview');
  return res.json();
}
