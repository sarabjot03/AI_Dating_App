import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PatchAvatarDto } from './dto/patch-avatar.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
type ProfilePrompt = {
    question: string;
    answer: string;
};
export declare class MeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
        questionnaire: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        onboardedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    upsertProfile(userId: string, dto: UpdateProfileDto): Promise<{
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
        questionnaire: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        onboardedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    patchAvatar(userId: string, dto: PatchAvatarDto): Promise<{
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
        questionnaire: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        onboardedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCompatibilityPreview(userId: string): Promise<import("./compatibility-score").CompatibilityPreviewResult>;
}
export {};
