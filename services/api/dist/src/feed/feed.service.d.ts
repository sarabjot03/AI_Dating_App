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
export declare class FeedService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private parseQuestionnaire;
    getFeed(userId: string): Promise<{
        cards: FeedCard[];
    }>;
    createSwipe(userId: string, targetUserId: string, action: 'like' | 'pass'): Promise<{
        ok: true;
        action: "like" | "pass";
        matched: boolean;
    }>;
    listMatches(userId: string): Promise<{
        matchId: string;
        createdAt: Date;
        user: {
            id: string;
            displayName: string | null;
            avatarDataUrl: string | null;
            city: string | null;
            aboutLine: string | null;
        };
    }[]>;
}
