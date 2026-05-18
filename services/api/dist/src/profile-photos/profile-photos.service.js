"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilePhotosService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../profile-generation/constants");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("./cloudinary.service");
let ProfilePhotosService = class ProfilePhotosService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    toDto(row) {
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
    async list(userId) {
        const rows = await this.prisma.profilePhoto.findMany({
            where: { userId },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return {
            photos: rows.map((r) => this.toDto(r)),
            count: rows.length,
            max: constants_1.PHOTOS_UPLOAD_MAX,
        };
    }
    async upload(userId, file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Missing file');
        }
        if (file.size > constants_1.PHOTO_MAX_UPLOAD_BYTES) {
            throw new common_1.BadRequestException('File too large');
        }
        const mime = file.mimetype?.toLowerCase() ?? '';
        if (!constants_1.ALLOWED_PHOTO_MIME_TYPES.includes(mime)) {
            throw new common_1.BadRequestException(`Unsupported image type: ${mime || 'unknown'}`);
        }
        const count = await this.prisma.profilePhoto.count({ where: { userId } });
        if (count >= constants_1.PHOTOS_UPLOAD_MAX) {
            throw new common_1.BadRequestException(`Maximum ${constants_1.PHOTOS_UPLOAD_MAX} photos allowed`);
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
    async remove(userId, photoId) {
        const row = await this.prisma.profilePhoto.findFirst({
            where: { id: photoId, userId },
        });
        if (!row) {
            throw new common_1.NotFoundException('Photo not found');
        }
        await this.cloudinary.deleteByPublicId(row.cloudinaryPublicId);
        await this.prisma.profilePhoto.delete({ where: { id: photoId } });
        return { ok: true };
    }
};
exports.ProfilePhotosService = ProfilePhotosService;
exports.ProfilePhotosService = ProfilePhotosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ProfilePhotosService);
//# sourceMappingURL=profile-photos.service.js.map