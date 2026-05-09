import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PatchAvatarDto } from './dto/patch-avatar.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MeService } from './me.service';

@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('profile')
  getProfile(@Req() req: { user: { userId: string } }) {
    return this.meService.getProfile(req.user.userId);
  }

  @Patch('profile')
  updateProfile(
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.meService.upsertProfile(req.user.userId, dto);
  }

  @Patch('avatar')
  patchAvatar(
    @Req() req: { user: { userId: string } },
    @Body() dto: PatchAvatarDto,
  ) {
    return this.meService.patchAvatar(req.user.userId, dto);
  }

  @Get('compatibility-preview')
  compatibilityPreview(@Req() req: { user: { userId: string } }) {
    return this.meService.getCompatibilityPreview(req.user.userId);
  }
}
