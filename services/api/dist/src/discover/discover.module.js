"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoverModule = void 0;
const common_1 = require("@nestjs/common");
const feed_module_1 = require("../feed/feed.module");
const discover_controller_1 = require("./discover.controller");
let DiscoverModule = class DiscoverModule {
};
exports.DiscoverModule = DiscoverModule;
exports.DiscoverModule = DiscoverModule = __decorate([
    (0, common_1.Module)({
        imports: [feed_module_1.FeedModule],
        controllers: [discover_controller_1.DiscoverController],
    })
], DiscoverModule);
//# sourceMappingURL=discover.module.js.map