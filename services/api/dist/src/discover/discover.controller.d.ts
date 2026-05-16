import { FeedService } from '../feed/feed.service';
export declare class DiscoverController {
    private readonly feed;
    constructor(feed: FeedService);
    candidates(req: {
        user: {
            userId: string;
        };
    }): Promise<import("../feed/feed.service").FeedCard[]>;
    like(req: {
        user: {
            userId: string;
        };
    }, targetUserId: string): Promise<{
        ok: true;
        action: "like" | "pass";
        matched: boolean;
    }>;
    matches(req: {
        user: {
            userId: string;
        };
    }): Promise<{
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
