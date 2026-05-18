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
export declare class ProfilePhotosService {
    private readonly prisma;
    private readonly cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private toDto;
    list(userId: string): Promise<{
        photos: ProfilePhotoDto[];
        count: number;
        max: number;
    }>;
    upload(userId: string, file: Express.Multer.File | undefined): Promise<ProfilePhotoDto>;
    remove(userId: string, photoId: string): Promise<{
        ok: true;
    }>;
}
