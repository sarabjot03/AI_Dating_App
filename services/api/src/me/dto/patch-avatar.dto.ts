import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PatchAvatarDto {
  /** Data URL (e.g. image/jpeg;base64,...) or null to remove. */
  @IsOptional()
  @IsString()
  @MaxLength(450_000)
  avatarDataUrl?: string | null;
}
