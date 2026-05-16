import { CreateSwipeDto } from './dto/create-swipe.dto';
import { FeedService } from './feed.service';
export declare class SwipesController {
    private readonly feed;
    constructor(feed: FeedService);
    swipe(req: {
        user: {
            userId: string;
        };
    }, dto: CreateSwipeDto): Promise<{
        ok: true;
        action: "like" | "pass";
        matched: boolean;
    }>;
}
