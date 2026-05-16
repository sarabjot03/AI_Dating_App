import { FeedService } from './feed.service';
export declare class FeedController {
    private readonly feed;
    constructor(feed: FeedService);
    getFeed(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        cards: import("./feed.service").FeedCard[];
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
