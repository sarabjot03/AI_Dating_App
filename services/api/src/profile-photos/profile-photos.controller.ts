import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PHOTO_MAX_UPLOAD_BYTES } from '../profile-generation/constants';
import { ProfilePhotosService } from './profile-photos.service';

@UseGuards(JwtAuthGuard)
@Controller('profile/photos')
export class ProfilePhotosController {
  constructor(private readonly photos: ProfilePhotosService) {}

  @Get()
  list(@Req() req: { user: { userId: string } }) {
    return this.photos.list(req.user.userId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: PHOTO_MAX_UPLOAD_BYTES },
    }),
  )
  upload(
    @Req() req: { user: { userId: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.photos.upload(req.user.userId, file);
  }

  @Delete(':photoId')
  remove(
    @Req() req: { user: { userId: string } },
    @Param('photoId') photoId: string,
  ) {
    return this.photos.remove(req.user.userId, photoId);
  }
}
