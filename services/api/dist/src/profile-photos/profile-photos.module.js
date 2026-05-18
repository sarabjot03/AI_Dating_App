"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilePhotosModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const cloudinary_service_1 = require("./cloudinary.service");
const profile_photos_controller_1 = require("./profile-photos.controller");
const profile_photos_service_1 = require("./profile-photos.service");
let ProfilePhotosModule = class ProfilePhotosModule {
};
exports.ProfilePhotosModule = ProfilePhotosModule;
exports.ProfilePhotosModule = ProfilePhotosModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [profile_photos_controller_1.ProfilePhotosController],
        providers: [cloudinary_service_1.CloudinaryService, profile_photos_service_1.ProfilePhotosService],
        exports: [profile_photos_service_1.ProfilePhotosService, cloudinary_service_1.CloudinaryService],
    })
], ProfilePhotosModule);
//# sourceMappingURL=profile-photos.module.js.map