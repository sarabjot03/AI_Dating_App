import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private readonly config;
    private readonly logger;
    private readonly configured;
    constructor(config: ConfigService);
    isReady(): boolean;
    uploadProfilePhoto(userId: string, buffer: Buffer, mimeType: string): Promise<{
        publicId: string;
        url: string;
        thumbnailUrl: string;
        width?: number;
        height?: number;
        bytes?: number;
    }>;
    deleteByPublicId(publicId: string): Promise<void>;
    private uploadBuffer;
}
