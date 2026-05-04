import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import type { AccessJwtPayload } from './jwt.strategy';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const REFRESH_DAYS = 30;
const BCRYPT_ROUNDS = 10;
const MSG91_DEFAULT_OTP_ENDPOINT = 'https://control.msg91.com/api/v5/otp';
const TWILIO_VERIFY_BASE = 'https://verify.twilio.com/v2';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private phoneToE164(phone10: string): string {
    return `+91${phone10}`;
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  private get isProduction(): boolean {
    return this.config.get<string>('APP_ENV') === 'production';
  }

  private get msg91Config() {
    return {
      authKey: this.config.get<string>('MSG91_AUTH_KEY')?.trim(),
      templateId: this.config.get<string>('MSG91_TEMPLATE_ID')?.trim(),
      endpoint:
        this.config.get<string>('MSG91_OTP_ENDPOINT')?.trim() ||
        MSG91_DEFAULT_OTP_ENDPOINT,
    };
  }

  private get twilioConfig() {
    const accountSid =
      this.config.get<string>('TWILIO_ACCOUNT_SID')?.trim() ||
      this.config.get<string>('TWILIO_ACC_SID')?.trim();
    return {
      accountSid,
      authToken: this.config.get<string>('TWILIO_AUTH_TOKEN')?.trim(),
      verifyServiceSid: this.config
        .get<string>('TWILIO_VERIFY_SERVICE_SID')
        ?.trim(),
    };
  }

  private get isTwilioConfigured(): boolean {
    const { accountSid, authToken, verifyServiceSid } = this.twilioConfig;
    return Boolean(accountSid && authToken && verifyServiceSid);
  }

  private async sendTwilioVerification(phoneE164: string): Promise<void> {
    const { accountSid, authToken, verifyServiceSid } = this.twilioConfig;
    if (!accountSid || !authToken || !verifyServiceSid) {
      throw new InternalServerErrorException('Twilio Verify not configured');
    }

    const body = new URLSearchParams({
      To: phoneE164,
      Channel: 'sms',
    });
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `${TWILIO_VERIFY_BASE}/Services/${verifyServiceSid}/Verifications`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Twilio verification send failed: ${response.status} ${errorBody}`,
      );
      throw new InternalServerErrorException('Failed to send OTP');
    }

    this.logger.log(`Twilio Verify: OTP sent to ${phoneE164}`);
  }

  private async checkTwilioVerification(
    phoneE164: string,
    code: string,
  ): Promise<boolean> {
    const { accountSid, authToken, verifyServiceSid } = this.twilioConfig;
    if (!accountSid || !authToken || !verifyServiceSid) {
      throw new InternalServerErrorException('Twilio Verify not configured');
    }

    const body = new URLSearchParams({
      To: phoneE164,
      Code: code,
    });
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `${TWILIO_VERIFY_BASE}/Services/${verifyServiceSid}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Twilio verification check failed: ${response.status} ${errorBody}`,
      );
      return false;
    }

    const payload = (await response.json()) as { status?: string; valid?: boolean };
    return payload.status === 'approved' || payload.valid === true;
  }

  private async upsertUserAndIssueTokens(phoneE164: string) {
    const user = await this.prisma.user.upsert({
      where: { phoneE164 },
      create: { phoneE164 },
      update: {},
    });
    return this.issueTokens(user.id);
  }

  private async sendMsg91Otp(phoneE164: string, code: string): Promise<void> {
    const { authKey, templateId, endpoint } = this.msg91Config;
    if (!authKey || !templateId) {
      if (this.isProduction) {
        throw new InternalServerErrorException(
          'OTP provider not configured on server',
        );
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
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async sendOtp(phone10: string) {
    const phoneE164 = this.phoneToE164(phone10);

    if (this.isTwilioConfigured) {
      await this.sendTwilioVerification(phoneE164);
      return { ok: true as const, expiresInSeconds: OTP_EXPIRY_MS / 1000 };
    }

    await this.prisma.otpChallenge.deleteMany({ where: { phoneE164 } });

    const code = String(randomInt(100_000, 1_000_000));
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.prisma.otpChallenge.create({
      data: { phoneE164, codeHash, expiresAt },
    });

    await this.sendMsg91Otp(phoneE164, code);

    if (!this.isProduction) {
      this.logger.log(`[dev] OTP for ${phoneE164}: ${code}`);
    }

    return { ok: true as const, expiresInSeconds: OTP_EXPIRY_MS / 1000 };
  }

  async verifyOtp(phone10: string, code: string) {
    const phoneE164 = this.phoneToE164(phone10);

    if (this.isTwilioConfigured) {
      const approved = await this.checkTwilioVerification(phoneE164, code);
      if (!approved) {
        throw new UnauthorizedException('Invalid or expired code');
      }
      return this.upsertUserAndIssueTokens(phoneE164);
    }

    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phoneE164 },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge || challenge.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      throw new HttpException('Too many attempts. Request a new code.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const match = await bcrypt.compare(code, challenge.codeHash);
    if (!match) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid code');
    }

    await this.prisma.otpChallenge.deleteMany({ where: { phoneE164 } });

    return this.upsertUserAndIssueTokens(phoneE164);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: row.id } });

    return this.issueTokens(row.userId);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
    return { ok: true as const };
  }

  private async issueTokens(userId: string) {
    const payload: AccessJwtPayload = { sub: userId, typ: 'access' };
    const accessToken = await this.jwt.signAsync(payload);

    const rawRefresh = randomBytes(48).toString('base64url');
    const tokenHash = this.hashRefreshToken(rawRefresh);
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken: rawRefresh,
      tokenType: 'Bearer' as const,
      expiresInSeconds: 15 * 60,
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
