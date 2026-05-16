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
exports.MeController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const patch_avatar_dto_1 = require("./dto/patch-avatar.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const me_service_1 = require("./me.service");
let MeController = class MeController {
    meService;
    constructor(meService) {
        this.meService = meService;
    }
    getProfile(req) {
        return this.meService.getProfile(req.user.userId);
    }
    updateProfile(req, dto) {
        return this.meService.upsertProfile(req.user.userId, dto);
    }
    patchAvatar(req, dto) {
        return this.meService.patchAvatar(req.user.userId, dto);
    }
    compatibilityPreview(req) {
        return this.meService.getCompatibilityPreview(req.user.userId);
    }
};
exports.MeController = MeController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], MeController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('avatar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, patch_avatar_dto_1.PatchAvatarDto]),
    __metadata("design:returntype", void 0)
], MeController.prototype, "patchAvatar", null);
__decorate([
    (0, common_1.Get)('compatibility-preview'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeController.prototype, "compatibilityPreview", null);
exports.MeController = MeController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('me'),
    __metadata("design:paramtypes", [me_service_1.MeService])
], MeController);
//# sourceMappingURL=me.controller.js.map