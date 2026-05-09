import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { computePairCompatibilityScore, type StoredQuestionnaire } from '../me/compatibility-score';
import { PrismaService } from '../prisma/prisma.service';

export type DiscoverCandidate = {
  id: string;
  displayName: string | null;
  city: string | null;
  aboutLine: string | null;
  bio: string | null;
  avatarDataUrl: string | null;
  matchPercent: number;
};

@Injectable()
export class DiscoverService {
  constructor(private readonly prisma: PrismaService) {}

  private parseQuestionnaire(raw: unknown): StoredQuestionnaire | null {
    if (!raw || typeof raw !== 'object' || raw === null || !('responses' in raw)) {
      return null;
    }
    return raw as StoredQuestionnaire;
  }

  async listCandidates(userId: string): Promise<DiscoverCandidate[]> {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me) throw new NotFoundException('User not found');

    const myQ = this.parseQuestionnaire(me.questionnaireJson);

    const alreadyLiked = await this.prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    });
    const skip = new Set(alreadyLiked.map((l) => l.toUserId));

    const others = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        onboardedAt: { not: null },
      },
      select: {
        id: true,
        displayName: true,
        city: true,
        aboutLine: true,
        bio: true,
        avatarDataUrl: true,
        questionnaireJson: true,
      },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });

    const out: DiscoverCandidate[] = [];
    for (const u of others) {
      if (skip.has(u.id)) continue;
      const theirQ = this.parseQuestionnaire(u.questionnaireJson);
      out.push({
        id: u.id,
        displayName: u.displayName,
        city: u.city,
        aboutLine: u.aboutLine,
        bio: u.bio,
        avatarDataUrl: u.avatarDataUrl,
        matchPercent: computePairCompatibilityScore(myQ, theirQ),
      });
    }
    return out;
  }

  async like(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot like yourself');
    }

    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, onboardedAt: { not: null } },
    });
    if (!target) {
      throw new NotFoundException('User not found or not onboarded');
    }

    await this.prisma.like.upsert({
      where: {
        fromUserId_toUserId: { fromUserId: userId, toUserId: targetUserId },
      },
      create: { fromUserId: userId, toUserId: targetUserId },
      update: {},
    });

    const reciprocal = await this.prisma.like.findUnique({
      where: {
        fromUserId_toUserId: { fromUserId: targetUserId, toUserId: userId },
      },
    });

    let matched = false;
    if (reciprocal) {
      const [low, high] = [userId, targetUserId].sort((a, b) => a.localeCompare(b));
      await this.prisma.match.upsert({
        where: { userAId_userBId: { userAId: low, userBId: high } },
        create: { userAId: low, userBId: high },
        update: {},
      });
      matched = true;
    }

    return { ok: true as const, matched };
  }

  async listMatches(userId: string) {
    const rows = await this.prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const partnerIds = rows.map((m) =>
      m.userAId === userId ? m.userBId : m.userAId,
    );

    if (!partnerIds.length) return [];

    const partners = await this.prisma.user.findMany({
      where: { id: { in: partnerIds } },
      select: {
        id: true,
        displayName: true,
        city: true,
        aboutLine: true,
        avatarDataUrl: true,
      },
    });

    const byId = new Map(partners.map((p) => [p.id, p]));
    return rows.map((m) => {
      const pid = m.userAId === userId ? m.userBId : m.userAId;
      const p = byId.get(pid);
      return {
        matchId: m.id,
        createdAt: m.createdAt,
        user: p ?? { id: pid, displayName: null, city: null, aboutLine: null, avatarDataUrl: null },
      };
    });
  }
}
