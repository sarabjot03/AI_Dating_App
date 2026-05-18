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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilePhotosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const constants_1 = require("../profile-generation/constants");
const profile_photos_service_1 = require("./profile-photos.service");
let ProfilePhotosController = class ProfilePhotosController {
    photos;
    constructor(photos) {
        this.photos = photos;
    }
    list(req) {
        return this.photos.list(req.user.userId);
    }
    upload(req, file) {
        return this.photos.upload(req.user.userId, file);
    }
    remove(req, photoId) {
        return this.photos.remove(req.user.userId, photoId);
    }
};
exports.ProfilePhotosController = ProfilePhotosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProfilePhotosController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: constants_1.PHOTO_MAX_UPLOAD_BYTES },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProfilePhotosController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)(':photoId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('photoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProfilePhotosController.prototype, "remove", null);
exports.ProfilePhotosController = ProfilePhotosController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('profile/photos'),
    __metadata("design:paramtypes", [profile_photos_service_1.ProfilePhotosService])
], ProfilePhotosController);
//# sourceMappingURL=profile-photos.controller.js.map