import { apiFetch } from '@/lib/api';

export type FeedCard = {
  id: string;
  displayName: string | null;
  city: string | null;
  aboutLine: string | null;
  bio: string | null;
  avatarDataUrl: string | null;
  matchPercent: number;
  distanceLabel: string;
};

export async function fetchFeed(): Promise<FeedCard[]> {
  const res = await apiFetch('/feed');
  const data = (await res.json()) as { cards: FeedCard[] };
  return data.cards ?? [];
}

export async function postSwipe(
  targetUserId: string,
  action: 'like' | 'pass',
): Promise<{ ok: true; action: 'like' | 'pass'; matched: boolean }> {
  const res = await apiFetch('/swipes', {
    method: 'POST',
    body: JSON.stringify({ targetUserId, action }),
  });
  return res.json();
}

export type MatchRow = {
  matchId: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string | null;
    city: string | null;
    aboutLine: string | null;
    avatarDataUrl: string | null;
  };
};

export async function fetchMatches(): Promise<MatchRow[]> {
  const res = await apiFetch('/feed/matches');
  return res.json();
}
