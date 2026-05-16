import { PatchAvatarDto } from './dto/patch-avatar.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MeService } from './me.service';
export declare class MeController {
    private readonly meService;
    constructor(meService: MeService);
    getProfile(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        id: string;
        phoneE164: string;
        displayName: string | null;
        avatarDataUrl: string | null;
        intent: string | null;
        city: string | null;
        energy: string | null;
        aboutLine: string | null;
        bio: string | null;
        prompts: {
            question: string;
            answer: string;
        }[];
        questionnaire: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
        onboardedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: {
        user: {
            userId: string;
        };
    }, dto: UpdateProfileDto): Promise<{
        id: string;
        phoneE164: string;
        displayName: string | null;
        avatarDataUrl: string | null;
        intent: string | null;
        city: string | null;
        energy: string | null;
        aboutLine: string | null;
        bio: string | null;
        prompts: {
            question: string;
            answer: string;
        }[];
        questionnaire: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
        onboardedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    patchAvatar(req: {
        user: {
            userId: string;
        };
    }, dto: PatchAvatarDto): Promise<{
        id: string;
        phoneE164: string;
        displayName: string | null;
        avatarDataUrl: string | null;
        intent: string | null;
        city: string | null;
        energy: string | null;
        aboutLine: string | null;
        bio: string | null;
        prompts: {
            question: string;
            answer: string;
        }[];
        questionnaire: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
        onboardedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    compatibilityPreview(req: {
        user: {
            userId: string;
        };
    }): Promise<import("./compatibility-score").CompatibilityPreviewResult>;
}
