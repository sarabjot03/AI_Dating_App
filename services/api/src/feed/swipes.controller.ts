import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import { FeedService } from './feed.service';

@UseGuards(JwtAuthGuard)
@Controller('swipes')
export class SwipesController {
  constructor(private readonly feed: FeedService) {}

  @Post()
  swipe(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateSwipeDto,
  ) {
    return this.feed.createSwipe(req.user.userId, dto.targetUserId, dto.action);
  }
}
