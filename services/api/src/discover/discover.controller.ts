import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DiscoverService } from './discover.service';

@UseGuards(JwtAuthGuard)
@Controller('discover')
export class DiscoverController {
  constructor(private readonly discover: DiscoverService) {}

  @Get('candidates')
  candidates(@Req() req: { user: { userId: string } }) {
    return this.discover.listCandidates(req.user.userId);
  }

  @Post('like/:targetUserId')
  like(
    @Req() req: { user: { userId: string } },
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.discover.like(req.user.userId, targetUserId);
  }

  @Get('matches')
  matches(@Req() req: { user: { userId: string } }) {
    return this.discover.listMatches(req.user.userId);
  }
}
