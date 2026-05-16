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
exports.DiscoverController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const feed_service_1 = require("../feed/feed.service");
let DiscoverController = class DiscoverController {
    feed;
    constructor(feed) {
        this.feed = feed;
    }
    async candidates(req) {
        const { cards } = await this.feed.getFeed(req.user.userId);
        return cards;
    }
    like(req, targetUserId) {
        return this.feed.createSwipe(req.user.userId, targetUserId, 'like');
    }
    matches(req) {
        return this.feed.listMatches(req.user.userId);
    }
};
exports.DiscoverController = DiscoverController;
__decorate([
    (0, common_1.Get)('candidates'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiscoverController.prototype, "candidates", null);
__decorate([
    (0, common_1.Post)('like/:targetUserId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('targetUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DiscoverController.prototype, "like", null);
__decorate([
    (0, common_1.Get)('matches'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DiscoverController.prototype, "matches", null);
exports.DiscoverController = DiscoverController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('discover'),
    __metadata("design:paramtypes", [feed_service_1.FeedService])
], DiscoverController);
//# sourceMappingURL=discover.controller.js.map