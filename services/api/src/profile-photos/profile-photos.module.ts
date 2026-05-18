import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';
import { ProfilePhotosController } from './profile-photos.controller';
import { ProfilePhotosService } from './profile-photos.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProfilePhotosController],
  providers: [CloudinaryService, ProfilePhotosService],
  exports: [ProfilePhotosService, CloudinaryService],
})
export class ProfilePhotosModule {}
