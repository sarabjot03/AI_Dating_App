import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from '../feed/feed.service';

/** @deprecated Use GET /v1/feed and POST /v1/swipes — kept for older app builds. */
@UseGuards(JwtAuthGuard)
@Controller('discover')
export class DiscoverController {
  constructor(private readonly feed: FeedService) {}

  @Get('candidates')
  async candidates(@Req() req: { user: { userId: string } }) {
    const { cards } = await this.feed.getFeed(req.user.userId);
    return cards;
  }

  @Post('like/:targetUserId')
  like(
    @Req() req: { user: { userId: string } },
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.feed.createSwipe(req.user.userId, targetUserId, 'like');
  }

  @Get('matches')
  matches(@Req() req: { user: { userId: string } }) {
    return this.feed.listMatches(req.user.userId);
  }
}
