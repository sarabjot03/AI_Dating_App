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
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const constants_1 = require("../profile-generation/constants");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    config;
    logger = new common_1.Logger(CloudinaryService_1.name);
    configured;
    constructor(config) {
        this.config = config;
        const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.config.get('CLOUDINARY_API_KEY');
        const apiSecret = this.config.get('CLOUDINARY_API_SECRET');
        this.configured = Boolean(cloudName && apiKey && apiSecret);
        if (this.configured) {
            cloudinary_1.v2.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
        }
        else {
            this.logger.warn('Cloudinary env vars missing — photo upload will fail until configured');
        }
    }
    isReady() {
        return this.configured;
    }
    async uploadProfilePhoto(userId, buffer, mimeType) {
        if (!this.configured) {
            throw new common_1.InternalServerErrorException('Photo storage is not configured');
        }
        const folder = `spark/profiles/${userId}`;
        const result = await this.uploadBuffer(buffer, {
            folder,
            resource_type: 'image',
            transformation: [{ width: 1600, crop: 'limit', quality: 'auto:good' }],
        });
        const thumbnailUrl = cloudinary_1.v2.url(result.public_id, {
            secure: true,
            transformation: [{ width: constants_1.PHOTO_AI_MAX_EDGE_PX, crop: 'limit', quality: 'auto:good' }],
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
    async deleteByPublicId(publicId) {
        if (!this.configured)
            return;
        try {
            await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: 'image' });
        }
        catch (e) {
            this.logger.warn(`Cloudinary delete failed for ${publicId}`, e);
        }
    }
    uploadBuffer(buffer, options) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream(options, (err, result) => {
                if (err || !result) {
                    reject(err ?? new Error('Empty Cloudinary response'));
                    return;
                }
                resolve(result);
            });
            stream.end(buffer);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map