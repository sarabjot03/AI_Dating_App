import { ProfilePhotosService } from './profile-photos.service';
export declare class ProfilePhotosController {
    private readonly photos;
    constructor(photos: ProfilePhotosService);
    list(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        photos: import("./profile-photos.service").ProfilePhotoDto[];
        count: number;
        max: number;
    }>;
    upload(req: {
        user: {
            userId: string;
        };
    }, file: Express.Multer.File): Promise<import("./profile-photos.service").ProfilePhotoDto>;
    remove(req: {
        user: {
            userId: string;
        };
    }, photoId: string): Promise<{
        ok: true;
    }>;
}
