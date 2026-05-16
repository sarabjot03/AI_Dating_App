import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    private phoneToE164;
    private hashRefreshToken;
    private get isProduction();
    private get msg91Config();
    private get twilioConfig();
    private get isTwilioConfigured();
    private sendTwilioVerification;
    private checkTwilioVerification;
    private upsertUserAndIssueTokens;
    private sendMsg91Otp;
    sendOtp(phone10: string): Promise<{
        ok: true;
        expiresInSeconds: number;
    }>;
    verifyOtp(phone10: string, code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: "Bearer";
        expiresInSeconds: number;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: "Bearer";
        expiresInSeconds: number;
    }>;
    logout(refreshToken: string): Promise<{
        ok: true;
    }>;
    private issueTokens;
    getUserById(userId: string): Promise<{
        id: string;
        phoneE164: string;
        displayName: string | null;
        avatarDataUrl: string | null;
        intent: string | null;
        city: string | null;
        energy: string | null;
        aboutLine: string | null;
        bio: string | null;
        promptsJson: import("@prisma/client/runtime/library").JsonValue | null;
        questionnaireJson: import("@prisma/client/runtime/library").JsonValue | null;
        onboardedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        isSeed: boolean;
    }>;
}
