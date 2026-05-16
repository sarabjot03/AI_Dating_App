"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const REFRESH_DAYS = 30;
const BCRYPT_ROUNDS = 10;
const MSG91_DEFAULT_OTP_ENDPOINT = 'https://control.msg91.com/api/v5/otp';
const TWILIO_VERIFY_BASE = 'https://verify.twilio.com/v2';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwt;
    config;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    phoneToE164(phone10) {
        return `+91${phone10}`;
    }
    hashRefreshToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token, 'utf8').digest('hex');
    }
    get isProduction() {
        return this.config.get('APP_ENV') === 'production';
    }
    get msg91Config() {
        return {
            authKey: this.config.get('MSG91_AUTH_KEY')?.trim(),
            templateId: this.config.get('MSG91_TEMPLATE_ID')?.trim(),
            endpoint: this.config.get('MSG91_OTP_ENDPOINT')?.trim() ||
                MSG91_DEFAULT_OTP_ENDPOINT,
        };
    }
    get twilioConfig() {
        const accountSid = this.config.get('TWILIO_ACCOUNT_SID')?.trim() ||
            this.config.get('TWILIO_ACC_SID')?.trim();
        return {
            accountSid,
            authToken: this.config.get('TWILIO_AUTH_TOKEN')?.trim(),
            verifyServiceSid: this.config
                .get('TWILIO_VERIFY_SERVICE_SID')
                ?.trim(),
        };
    }
    get isTwilioConfigured() {
        const { accountSid, authToken, verifyServiceSid } = this.twilioConfig;
        return Boolean(accountSid && authToken && verifyServiceSid);
    }
    async sendTwilioVerification(phoneE164) {
        const { accountSid, authToken, verifyServiceSid } = this.twilioConfig;
        if (!accountSid || !authToken || !verifyServiceSid) {
            throw new common_1.InternalServerErrorException('Twilio Verify not configured');
        }
        const body = new URLSearchParams({
            To: phoneE164,
            Channel: 'sms',
        });
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const response = await fetch(`${TWILIO_VERIFY_BASE}/Services/${verifyServiceSid}/Verifications`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            this.logger.error(`Twilio verification send failed: ${response.status} ${errorBody}`);
            throw new common_1.InternalServerErrorException('Failed to send OTP');
        }
        this.logger.log(`Twilio Verify: OTP sent to ${phoneE164}`);
    }
    async checkTwilioVerification(phoneE164, code) {
        const { accountSid, authToken, verifyServiceSid } = this.twilioConfig;
        if (!accountSid || !authToken || !verifyServiceSid) {
            throw new common_1.InternalServerErrorException('Twilio Verify not configured');
        }
        const body = new URLSearchParams({
            To: phoneE164,
            Code: code,
        });
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const response = await fetch(`${TWILIO_VERIFY_BASE}/Services/${verifyServiceSid}/VerificationCheck`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            this.logger.error(`Twilio verification check failed: ${response.status} ${errorBody}`);
            return false;
        }
        const payload = (await response.json());
        return payload.status === 'approved' || payload.valid === true;
    }
    async upsertUserAndIssueTokens(phoneE164) {
        const user = await this.prisma.user.upsert({
            where: { phoneE164 },
            create: { phoneE164 },
            update: {},
        });
        return this.issueTokens(user.id);
    }
    async sendMsg91Otp(phoneE164, code) {
        const { authKey, templateId, endpoint } = this.msg91Config;
        if (!authKey || !templateId) {
            if (this.isProduction) {
                throw new common_1.InternalServerErrorException('OTP provider not configured on server');
            }
            return;
        }
        const mobile = phoneE164.replace('+', '');
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                authkey: authKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile,
                otp: code,
                template_id: templateId,
                otp_expiry: Math.floor(OTP_EXPIRY_MS / 1000 / 60),
                realTimeResponse: 1,
            }),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            this.logger.error(`MSG91 OTP send failed: ${response.status} ${errorBody}`);
            throw new common_1.InternalServerErrorException('Failed to send OTP');
        }
    }
    async sendOtp(phone10) {
        const phoneE164 = this.phoneToE164(phone10);
        if (this.isTwilioConfigured) {
            await this.sendTwilioVerification(phoneE164);
            return { ok: true, expiresInSeconds: OTP_EXPIRY_MS / 1000 };
        }
        await this.prisma.otpChallenge.deleteMany({ where: { phoneE164 } });
        const code = String((0, crypto_1.randomInt)(100_000, 1_000_000));
        const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        await this.prisma.otpChallenge.create({
            data: { phoneE164, codeHash, expiresAt },
        });
        await this.sendMsg91Otp(phoneE164, code);
        if (!this.isProduction) {
            this.logger.log(`[dev] OTP for ${phoneE164}: ${code}`);
        }
        return { ok: true, expiresInSeconds: OTP_EXPIRY_MS / 1000 };
    }
    async verifyOtp(phone10, code) {
        const phoneE164 = this.phoneToE164(phone10);
        if (this.isTwilioConfigured) {
            const approved = await this.checkTwilioVerification(phoneE164, code);
            if (!approved) {
                throw new common_1.UnauthorizedException('Invalid or expired code');
            }
            return this.upsertUserAndIssueTokens(phoneE164);
        }
        const challenge = await this.prisma.otpChallenge.findFirst({
            where: { phoneE164 },
            orderBy: { createdAt: 'desc' },
        });
        if (!challenge || challenge.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired code');
        }
        if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
            throw new common_1.HttpException('Too many attempts. Request a new code.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const match = await bcrypt.compare(code, challenge.codeHash);
        if (!match) {
            await this.prisma.otpChallenge.update({
                where: { id: challenge.id },
                data: { attempts: { increment: 1 } },
            });
            throw new common_1.UnauthorizedException('Invalid code');
        }
        await this.prisma.otpChallenge.deleteMany({ where: { phoneE164 } });
        return this.upsertUserAndIssueTokens(phoneE164);
    }
    async refresh(refreshToken) {
        const tokenHash = this.hashRefreshToken(refreshToken);
        const row = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!row || row.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        await this.prisma.refreshToken.delete({ where: { id: row.id } });
        return this.issueTokens(row.userId);
    }
    async logout(refreshToken) {
        const tokenHash = this.hashRefreshToken(refreshToken);
        await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
        return { ok: true };
    }
    async issueTokens(userId) {
        const payload = { sub: userId, typ: 'access' };
        const accessToken = await this.jwt.signAsync(payload);
        const rawRefresh = (0, crypto_1.randomBytes)(48).toString('base64url');
        const tokenHash = this.hashRefreshToken(rawRefresh);
        const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
        return {
            accessToken,
            refreshToken: rawRefresh,
            tokenType: 'Bearer',
            expiresInSeconds: 15 * 60,
        };
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map