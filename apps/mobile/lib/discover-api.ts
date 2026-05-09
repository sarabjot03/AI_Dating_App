import { apiFetch } from '@/lib/api';

export type DiscoverCandidate = {
  id: string;
  displayName: string | null;
  city: string | null;
  aboutLine: string | null;
  bio: string | null;
  avatarDataUrl: string | null;
  matchPercent: number;
};

export async function fetchDiscoverCandidates(): Promise<DiscoverCandidate[]> {
  const res = await apiFetch('/discover/candidates');
  return res.json();
}

export async function likeDiscoverUser(targetUserId: string): Promise<{ ok: true; matched: boolean }> {
  const res = await apiFetch(`/discover/like/${targetUserId}`, { method: 'POST' });
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
  const res = await apiFetch('/discover/matches');
  return res.json();
}
