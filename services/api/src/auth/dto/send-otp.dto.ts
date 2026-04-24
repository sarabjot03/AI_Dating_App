import { Matches } from 'class-validator';

export class SendOtpDto {
  /** 10-digit Indian mobile without country code (starts 6–9). */
  @Matches(/^[6-9]\d{9}$/, { message: 'phone must be a valid 10-digit Indian mobile number' })
  phone!: string;
}
