import { OtpRepository, UserRepository } from "@/infrastructure/persistence/repositories";
import { EmailUseCase } from "@/core/application/useCases";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";
import { serviceError } from "@/core/application/common";
import { OtpType } from "@prisma/client";
import {
  ok,
  fail,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;
const MAX_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

class OtpUseCase {
  private static readonly SCOPE = "OtpUseCase";

  constructor(
    private otpRepository: OtpRepository,
    private userRepository: UserRepository,
    private emailUseCase: EmailUseCase
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async send(dto: SendOtpRequest): Promise<SendOtpResponse> {
    try {
      const email = InputSanitizer.sanitizeEmail(dto.email);

      if (!SecurityValidator.isValidEmail(email)) {
        return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");
      }

      const recentCount = await this.otpRepository.countRecentByEmail(email, HOUR_MS);
      if (recentCount >= MAX_PER_HOUR) {
        return fail("RATE_LIMITED", "لقد تجاوزت الحد المسموح به. يرجى المحاولة لاحقاً");
      }

      const lastSentAt = await this.otpRepository.getLastSentAt(email, dto.type);
      if (lastSentAt) {
        const secondsElapsed = (Date.now() - lastSentAt.getTime()) / 1000;
        const cooldownSeconds = Math.ceil(COOLDOWN_MS / 1000 - secondsElapsed);
        if (cooldownSeconds > 0) {
          return fail("RATE_LIMITED", `يرجى الانتظار ${cooldownSeconds} ثانية قبل إعادة الإرسال`);
        }
      }

      await this.otpRepository.invalidatePrevious(email, dto.type);

      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      await this.otpRepository.create(email, code, dto.type, expiresAt);

      await this.emailUseCase.sendOtpEmail(email, code, dto.type);

      logger.info(OtpUseCase.SCOPE, "send", `OTP sent to ${email} type=${dto.type}`);
      return ok({ cooldownSeconds: Math.ceil(COOLDOWN_MS / 1000) });
    } catch (error) {
      return serviceError(OtpUseCase.SCOPE, "send", error, "حدث خطأ أثناء إرسال الرمز");
    }
  }

  async verify(dto: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    try {
      const email = InputSanitizer.sanitizeEmail(dto.email);

      const record = await this.otpRepository.findValid(email, dto.type);

      if (!record) {
        return fail("INVALID_OTP", "الرمز غير صحيح أو منتهي الصلاحية");
      }

      if (record.code !== dto.code.trim()) {
        return fail("INVALID_OTP", "الرمز غير صحيح");
      }

      await this.otpRepository.markUsed(record.id);

      if (dto.type === OtpType.EMAIL_VERIFY) {
        const user = await this.userRepository.findByEmail(email);
        if (user) {
          user.verifyEmail();
          await this.userRepository.update(user);
        }
      }

      logger.info(OtpUseCase.SCOPE, "verify", `OTP verified for ${email} type=${dto.type}`);
      return ok({ verified: true });
    } catch (error) {
      return serviceError(OtpUseCase.SCOPE, "verify", error, "حدث خطأ أثناء التحقق من الرمز");
    }
  }

  async check(dto: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    try {
      const email = InputSanitizer.sanitizeEmail(dto.email);
      const valid = await this.otpRepository.checkValid(email, dto.code.trim(), dto.type);
      if (!valid) return fail("INVALID_OTP", "الرمز غير صحيح أو منتهي الصلاحية");
      return ok({ verified: true });
    } catch (error) {
      return serviceError(OtpUseCase.SCOPE, "check", error, "حدث خطأ أثناء التحقق من الرمز");
    }
  }
}

export default OtpUseCase;
