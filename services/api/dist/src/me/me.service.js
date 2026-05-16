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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeService = void 0;
const common_1 = require("@nestjs/common");
const compatibility_score_1 = require("./compatibility-score");
const prisma_service_1 = require("../prisma/prisma.service");
let MeService = class MeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const prompts = Array.isArray(user.promptsJson) ? user.promptsJson : [];
        const questionnaire = user.questionnaireJson ?? null;
        return {
            id: user.id,
            phoneE164: user.phoneE164,
            displayName: user.displayName,
            avatarDataUrl: user.avatarDataUrl,
            intent: user.intent,
            city: user.city,
            energy: user.energy,
            aboutLine: user.aboutLine,
            bio: user.bio,
            prompts,
            questionnaire,
            onboardedAt: user.onboardedAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async upsertProfile(userId, dto) {
        if (dto.avatarDataUrl != null &&
            dto.avatarDataUrl !== undefined &&
            dto.avatarDataUrl.length > 450_000) {
            throw new common_1.BadRequestException('Photo payload too large');
        }
        const promptsJson = dto.prompts;
        const data = {
            displayName: dto.displayName.trim(),
            intent: dto.intent.trim(),
            city: dto.city.trim(),
            energy: dto.energy.trim(),
            aboutLine: dto.aboutLine.trim(),
            bio: dto.bio.trim(),
            promptsJson,
            onboardedAt: dto.onboarded ? new Date() : undefined,
        };
        if (dto.avatarDataUrl !== undefined) {
            data.avatarDataUrl = dto.avatarDataUrl;
        }
        if (dto.questionnaire != null) {
            data.questionnaireJson = dto.questionnaire;
        }
        await this.prisma.user.update({
            where: { id: userId },
            data,
        });
        return this.getProfile(userId);
    }
    async patchAvatar(userId, dto) {
        if (dto.avatarDataUrl === undefined) {
            return this.getProfile(userId);
        }
        const v = dto.avatarDataUrl;
        if (v != null && v.length > 450_000) {
            throw new common_1.BadRequestException('Photo payload too large');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { avatarDataUrl: v },
        });
        return this.getProfile(userId);
    }
    async getCompatibilityPreview(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const raw = user.questionnaireJson;
        const stored = raw && typeof raw === 'object' && raw !== null && 'responses' in raw
            ? raw
            : null;
        return (0, compatibility_score_1.computeCompatibilityPreview)(stored);
    }
};
exports.MeService = MeService;
exports.MeService = MeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeService);
//# sourceMappingURL=me.service.js.map