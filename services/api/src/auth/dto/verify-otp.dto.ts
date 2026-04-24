import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
