import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ALLOWED_PHOTO_MIME_TYPES,
  PHOTO_MAX_UPLOAD_BYTES,
  PHOTOS_UPLOAD_MAX,
} from '../profile-generation/constants';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';

export type ProfilePhotoDto = {
  id: string;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
  width: number | null;
  height: number | null;
  caption: string | null;
  isSelected: boolean;
  createdAt: string;
};

@Injectable()
export class ProfilePhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private toDto(row: {
    id: string;
    url: string;
    thumbnailUrl: string;
    sortOrder: number;
    width: number | null;
    height: number | null;
    caption: string | null;
    isSelected: boolean;
    createdAt: Date;
  }): ProfilePhotoDto {
    return {
      id: row.id,
      url: row.url,
      thumbnailUrl: row.thumbnailUrl,
      sortOrder: row.sortOrder,
      width: row.width,
      height: row.height,
      caption: row.caption,
      isSelected: row.isSelected,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async list(userId: string): Promise<{ photos: ProfilePhotoDto[]; count: number; max: number }> {
    const rows = await this.prisma.profilePhoto.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return {
      photos: rows.map((r) => this.toDto(r)),
      count: rows.length,
      max: PHOTOS_UPLOAD_MAX,
    };
  }

  async upload(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<ProfilePhotoDto> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Missing file');
    }
    if (file.size > PHOTO_MAX_UPLOAD_BYTES) {
      throw new BadRequestException('File too large');
    }
    const mime = file.mimetype?.toLowerCase() ?? '';
    if (!ALLOWED_PHOTO_MIME_TYPES.includes(mime as (typeof ALLOWED_PHOTO_MIME_TYPES)[number])) {
      throw new BadRequestException(`Unsupported image type: ${mime || 'unknown'}`);
    }

    const count = await this.prisma.profilePhoto.count({ where: { userId } });
    if (count >= PHOTOS_UPLOAD_MAX) {
      throw new BadRequestException(`Maximum ${PHOTOS_UPLOAD_MAX} photos allowed`);
    }

    const uploaded = await this.cloudinary.uploadProfilePhoto(userId, file.buffer, mime);

    const row = await this.prisma.profilePhoto.create({
      data: {
        userId,
        cloudinaryPublicId: uploaded.publicId,
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        sortOrder: count,
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
        bytes: uploaded.bytes ?? null,
        mimeType: mime,
      },
    });

    return this.toDto(row);
  }

  async remove(userId: string, photoId: string): Promise<{ ok: true }> {
    const row = await this.prisma.profilePhoto.findFirst({
      where: { id: photoId, userId },
    });
    if (!row) {
      throw new NotFoundException('Photo not found');
    }
    await this.cloudinary.deleteByPublicId(row.cloudinaryPublicId);
    await this.prisma.profilePhoto.delete({ where: { id: photoId } });
    return { ok: true as const };
  }
}
