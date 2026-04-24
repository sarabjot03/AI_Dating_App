import {
  HttpException,
  HttpStatus,
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

  async sendOtp(phone10: string) {
    const phoneE164 = this.phoneToE164(phone10);

    await this.prisma.otpChallenge.deleteMany({ where: { phoneE164 } });

    const code = String(randomInt(100_000, 1_000_000));
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.prisma.otpChallenge.create({
      data: { phoneE164, codeHash, expiresAt },
    });

    if (this.config.get('APP_ENV') !== 'production') {
      this.logger.log(`[dev] OTP for ${phoneE164}: ${code}`);
    }

    return { ok: true as const, expiresInSeconds: OTP_EXPIRY_MS / 1000 };
  }

  async verifyOtp(phone10: string, code: string) {
    const phoneE164 = this.phoneToE164(phone10);

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

    const user = await this.prisma.user.upsert({
      where: { phoneE164 },
      create: { phoneE164 },
      update: {},
    });

    return this.issueTokens(user.id);
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
