import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  getFeed(@Req() req: { user: { userId: string } }) {
    return this.feed.getFeed(req.user.userId);
  }

  @Get('matches')
  matches(@Req() req: { user: { userId: string } }) {
    return this.feed.listMatches(req.user.userId);
  }
}
