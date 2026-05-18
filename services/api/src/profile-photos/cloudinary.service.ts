import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

import { PHOTO_AI_MAX_EDGE_PX } from '../profile-generation/constants';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    this.configured = Boolean(cloudName && apiKey && apiSecret);
    if (this.configured) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    } else {
      this.logger.warn('Cloudinary env vars missing — photo upload will fail until configured');
    }
  }

  isReady(): boolean {
    return this.configured;
  }

  async uploadProfilePhoto(
    userId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{
    publicId: string;
    url: string;
    thumbnailUrl: string;
    width?: number;
    height?: number;
    bytes?: number;
  }> {
    if (!this.configured) {
      throw new InternalServerErrorException('Photo storage is not configured');
    }

    const folder = `spark/profiles/${userId}`;
    const result = await this.uploadBuffer(buffer, {
      folder,
      resource_type: 'image',
      transformation: [{ width: 1600, crop: 'limit', quality: 'auto:good' }],
    });

    const thumbnailUrl = cloudinary.url(result.public_id, {
      secure: true,
      transformation: [{ width: PHOTO_AI_MAX_EDGE_PX, crop: 'limit', quality: 'auto:good' }],
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      thumbnailUrl,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    if (!this.configured) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (e) {
      this.logger.warn(`Cloudinary delete failed for ${publicId}`, e);
    }
  }

  private uploadBuffer(
    buffer: Buffer,
    options: Record<string, unknown>,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (err, result) => {
          if (err || !result) {
            reject(err ?? new Error('Empty Cloudinary response'));
            return;
          }
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }
}
