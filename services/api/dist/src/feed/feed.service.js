"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const compatibility_score_1 = require("../me/compatibility-score");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedService = FeedService_1 = class FeedService {
    prisma;
    logger = new common_1.Logger(FeedService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    parseQuestionnaire(raw) {
        if (!raw || typeof raw !== 'object' || raw === null || !('responses' in raw)) {
            return null;
        }
        return raw;
    }
    async getFeed(userId) {
        const me = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!me)
            throw new common_1.NotFoundException('User not found');
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
        const cards = [];
        for (const u of others) {
            if (skip.has(u.id))
                continue;
            const theirQ = this.parseQuestionnaire(u.questionnaireJson);
            const { matchPercent, distanceLabel } = (0, compatibility_score_1.computeFeedMatchScore)(myQ, theirQ, me.city, u.city);
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
    async createSwipe(userId, targetUserId, action) {
        if (userId === targetUserId) {
            throw new common_1.BadRequestException('Cannot swipe on yourself');
        }
        const target = await this.prisma.user.findFirst({
            where: { id: targetUserId, onboardedAt: { not: null } },
        });
        if (!target) {
            throw new common_1.NotFoundException('User not found or not onboarded');
        }
        const swipeAction = action === 'like' ? client_1.SwipeAction.like : client_1.SwipeAction.pass;
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
            if (reciprocal?.action === client_1.SwipeAction.like) {
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
        return { ok: true, action, matched };
    }
    async listMatches(userId) {
        const rows = await this.prisma.match.findMany({
            where: {
                OR: [{ userAId: userId }, { userBId: userId }],
            },
            orderBy: { createdAt: 'desc' },
        });
        const partnerIds = rows.map((m) => m.userAId === userId ? m.userBId : m.userAId);
        if (!partnerIds.length)
            return [];
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
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = FeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedService);
//# sourceMappingURL=feed.service.js.map