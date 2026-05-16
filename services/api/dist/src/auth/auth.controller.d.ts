import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    sendOtp(dto: SendOtpDto): Promise<{
        ok: true;
        expiresInSeconds: number;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: "Bearer";
        expiresInSeconds: number;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        tokenType: "Bearer";
        expiresInSeconds: number;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        ok: true;
    }>;
    me(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        id: string;
        phoneE164: string;
        createdAt: Date;
    }>;
}
