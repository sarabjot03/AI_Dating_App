import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SwipeAction } from '@prisma/client';

import {
  computeFeedMatchScore,
  type StoredQuestionnaire,
} from '../me/compatibility-score';
import { PrismaService } from '../prisma/prisma.service';

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

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  private parseQuestionnaire(raw: unknown): StoredQuestionnaire | null {
    if (!raw || typeof raw !== 'object' || raw === null || !('responses' in raw)) {
      return null;
    }
    return raw as StoredQuestionnaire;
  }

  async getFeed(userId: string): Promise<{ cards: FeedCard[] }> {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me) throw new NotFoundException('User not found');

    const myQ = this.parseQuestionnaire(me.questionnaireJson);

    const swiped = await this.prisma.swipe.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    });
    const skip = new Set(swiped.map((s) => s.toUserId));

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
      take: 80,
      orderBy: { updatedAt: 'desc' },
    });

    const cards: FeedCard[] = [];
    for (const u of others) {
      if (skip.has(u.id)) continue;
      const theirQ = this.parseQuestionnaire(u.questionnaireJson);
      const { matchPercent, distanceLabel } = computeFeedMatchScore(
        myQ,
        theirQ,
        me.city,
        u.city,
      );
      cards.push({
        id: u.id,
        displayName: u.displayName,
        city: u.city,
        aboutLine: u.aboutLine,
        bio: u.bio,
        avatarDataUrl: u.avatarDataUrl,
        matchPercent,
        distanceLabel,
      });
    }

    cards.sort((a, b) => b.matchPercent - a.matchPercent);
    return { cards: cards.slice(0, 50) };
  }

  async createSwipe(userId: string, targetUserId: string, action: 'like' | 'pass') {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot swipe on yourself');
    }

    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, onboardedAt: { not: null } },
    });
    if (!target) {
      throw new NotFoundException('User not found or not onboarded');
    }

    const swipeAction: SwipeAction = action === 'like' ? SwipeAction.like : SwipeAction.pass;

    await this.prisma.swipe.upsert({
      where: {
        fromUserId_toUserId: { fromUserId: userId, toUserId: targetUserId },
      },
      create: { fromUserId: userId, toUserId: targetUserId, action: swipeAction },
      update: { action: swipeAction },
    });

    this.logger.log(`Swipe ${action} from ${userId} → ${targetUserId}`);

    let matched = false;
    if (action === 'like') {
      await this.prisma.like.upsert({
        where: {
          fromUserId_toUserId: { fromUserId: userId, toUserId: targetUserId },
        },
        create: { fromUserId: userId, toUserId: targetUserId },
        update: {},
      });

      const reciprocal = await this.prisma.swipe.findUnique({
        where: {
          fromUserId_toUserId: { fromUserId: targetUserId, toUserId: userId },
        },
      });

      if (reciprocal?.action === SwipeAction.like) {
        const [low, high] = [userId, targetUserId].sort((a, b) => a.localeCompare(b));
        await this.prisma.match.upsert({
          where: { userAId_userBId: { userAId: low, userBId: high } },
          create: { userAId: low, userBId: high },
          update: {},
        });
        matched = true;
        this.logger.log(`Match created ${low} ↔ ${high}`);
      }
    }

    return { ok: true as const, action, matched };
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
