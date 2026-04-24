import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

type ProfilePrompt = { question: string; answer: string };

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const prompts = Array.isArray(user.promptsJson) ? (user.promptsJson as unknown as ProfilePrompt[]) : [];

    return {
      id: user.id,
      phoneE164: user.phoneE164,
      intent: user.intent,
      city: user.city,
      energy: user.energy,
      aboutLine: user.aboutLine,
      bio: user.bio,
      prompts,
      onboardedAt: user.onboardedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async upsertProfile(userId: string, dto: UpdateProfileDto) {
    const promptsJson = dto.prompts as unknown as Prisma.InputJsonValue;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        intent: dto.intent.trim(),
        city: dto.city.trim(),
        energy: dto.energy.trim(),
        aboutLine: dto.aboutLine.trim(),
        bio: dto.bio.trim(),
        promptsJson,
        onboardedAt: dto.onboarded ? new Date() : undefined,
      },
    });

    return this.getProfile(userId);
  }
}
