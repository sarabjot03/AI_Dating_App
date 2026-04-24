import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

class ProfilePromptDto {
  @IsString()
  @Length(2, 80)
  question!: string;

  @IsString()
  @Length(2, 280)
  answer!: string;
}

export class UpdateProfileDto {
  @IsString()
  @Length(2, 80)
  intent!: string;

  @IsString()
  @Length(2, 80)
  city!: string;

  @IsString()
  @Length(2, 80)
  energy!: string;

  @IsString()
  @Length(8, 200)
  aboutLine!: string;

  @IsString()
  @Length(20, 500)
  bio!: string;

  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => ProfilePromptDto)
  prompts!: ProfilePromptDto[];

  @IsOptional()
  @IsBoolean()
  onboarded?: boolean;
}
