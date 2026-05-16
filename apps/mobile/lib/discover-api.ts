/** @deprecated Use @/lib/feed-api */
import { fetchFeed, fetchMatches, postSwipe, type FeedCard, type MatchRow } from '@/lib/feed-api';

export type DiscoverCandidate = FeedCard;
export { fetchMatches, type MatchRow };

export async function fetchDiscoverCandidates(): Promise<FeedCard[]> {
  return fetchFeed();
}

export async function likeDiscoverUser(
  targetUserId: string,
): Promise<{ ok: true; matched: boolean }> {
  const r = await postSwipe(targetUserId, 'like');
  return { ok: r.ok, matched: r.matched };
}
