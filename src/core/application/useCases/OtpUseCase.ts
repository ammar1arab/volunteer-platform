import {
  OtpRepository,
  UserRepository,
  PendingRegistrationRepository
} from "@/infrastructure/persistence/repositories";
import { EmailUseCase, SystemLogUseCase } from "@/core/application/useCases";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";
import { serviceError } from "@/core/application/common";
import { prisma } from "@/infrastructure/persistence/prisma";
import { UserRole, JordanianCity, Gender, EducationLevel, NotificationType, OtpType, SystemLogStatus } from "@/core/domain/enums";
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
const MAX_ATTEMPTS = 5;

class OtpUseCase {
  private static readonly SCOPE = "OtpUseCase";

  constructor(
    private otpRepository: OtpRepository,
    private userRepository: UserRepository,
    private emailUseCase: EmailUseCase,
    private pendingRepository: PendingRegistrationRepository,
    private systemLogUseCase: SystemLogUseCase
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async send(dto: SendOtpRequest): Promise<SendOtpResponse> {
    try {
      const email = InputSanitizer.sanitizeEmail(dto.email);
      if (!SecurityValidator.isValidEmail(email)) return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");

      const recentCount = await this.otpRepository.countRecentByEmail(email, HOUR_MS);
      if (recentCount >= MAX_PER_HOUR) {
        if (this.systemLogUseCase) {
          await this.systemLogUseCase.logAction({ action: "OTP_RATE_LIMIT", status: SystemLogStatus.ERROR, message: "تجاوز حد إرسال رمز التحقق", metadata: { email, type: dto.type } });
        }
        return fail("RATE_LIMITED", "لقد تجاوزت الحد المسموح به. يرجى المحاولة لاحقاً");
      }

      const lastSentAt = await this.otpRepository.getLastSentAt(email, dto.type);
      if (lastSentAt) {
        const secondsElapsed = (Date.now() - lastSentAt.getTime()) / 1000;
        const cooldownSeconds = Math.ceil(COOLDOWN_MS / 1000 - secondsElapsed);
        if (cooldownSeconds > 0)
          return fail("RATE_LIMITED", `يرجى الانتظار ${cooldownSeconds} ثانية قبل إعادة الإرسال`);
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

      if (!record) return fail("INVALID_OTP", "الرمز غير صحيح أو منتهي الصلاحية");


      if (record.code !== dto.code.trim()) {
        const attempts = await this.otpRepository.incrementAttempts(record.id);
        if (attempts >= MAX_ATTEMPTS) {
          await this.otpRepository.markUsed(record.id);
          if (this.systemLogUseCase) {
            await this.systemLogUseCase.logAction({ action: "OTP_VERIFY_FAILED", status: SystemLogStatus.FAILURE, message: "تجاوز الحد الأقصى لمحاولات إدخال الرمز الخاطئ", metadata: { email, type: dto.type } });
          }
          return fail("INVALID_OTP", "تم تجاوز عدد المحاولات المسموحة");
        }
        if (this.systemLogUseCase) {
          await this.systemLogUseCase.logAction({ action: "OTP_VERIFY_FAILED", status: SystemLogStatus.ERROR, message: "محاولة إدخال رمز خاطئ", metadata: { email, type: dto.type, attempts } });
        }
        return fail("INVALID_OTP", `الرمز غير صحيح. متبقي ${MAX_ATTEMPTS - attempts} محاولات`);
      }

      await this.otpRepository.markUsed(record.id);

      if (dto.type === OtpType.EMAIL_VERIFY) {
        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
          existingUser.verifyEmail();
          await this.userRepository.update(existingUser);
        } else {
          const pending = await this.pendingRepository.findByEmail(email);
          if (!pending) return fail("NOT_FOUND", "انتهت صلاحية البيانات. أعد التسجيل");

          try {
            await prisma.$transaction(async (tx) => {
              const createdUser = await tx.user.create({
                data: {
                  email: pending.email,
                  password: pending.password,
                  fullName: pending.fullName,
                  phone: pending.phone,
                  role: UserRole.VOLUNTEER,
                  emailVerified: true,
                  isActive: true
                }
              });

              await tx.volunteerProfile.create({
                data: {
                  userId: createdUser.id,
                  city: pending.city as JordanianCity,
                  dateOfBirth: pending.dateOfBirth,
                  gender: (pending.gender as Gender) ?? null,
                  membershipNumber: pending.membershipNumber ?? null,
                  educationLevel: (pending.educationLevel as EducationLevel) ?? null,
                  occupation: pending.occupation ?? null,
                  languages: pending.languages ?? [],
                  preferredVolunteerTypes: pending.preferredVolunteerTypes ?? [],
                  skills: pending.skills ?? [],
                  interests: pending.interests ?? [],
                  hasVolunteerExperience: pending.hasVolunteerExperience ?? false,
                  totalVolunteerHours: 0,
                  isActive: true
                }
              });

              await tx.notification.create({
                data: {
                  userId: createdUser.id,
                  type: NotificationType.WELCOME,
                  title: "مرحباً بك في بصمات شبابية",
                  message: `أهلاً ${pending.fullName}، انضمامك إلينا هو بداية رحلة تطوعية مميزة. استكشف الفرص المتاحة وابدأ في صنع الأثر.`
                }
              });

              await tx.pendingRegistration.delete({
                where: { email: email.toLowerCase() }
              });
            });

            logger.info(OtpUseCase.SCOPE, "verify", `New user created: ${email}`);
          } catch (dbError) {
            console.error("TRANSACTION_FAILED:", dbError);
            return fail("SERVER_ERROR", "حدث خطأ أثناء حفظ البيانات");
          }
        }
      }

      return ok({ verified: true });
    } catch (error) {
      return serviceError(OtpUseCase.SCOPE, "verify", error, "خطأ في التحقق");
    }
  }

  async check(dto: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    try {
      const email = InputSanitizer.sanitizeEmail(dto.email);
      const record = await this.otpRepository.findValid(email, dto.type);

      if (!record) return fail("INVALID_OTP", "الرمز غير صحيح أو منتهي الصلاحية");

      if (record.code !== dto.code.trim()) {
        const attempts = await this.otpRepository.incrementAttempts(record.id);
        if (attempts >= MAX_ATTEMPTS) {
          await this.otpRepository.markUsed(record.id);
          return fail("INVALID_OTP", "تم تجاوز عدد المحاولات المسموحة. يرجى طلب رمز جديد");
        }
        return fail("INVALID_OTP", "الرمز غير صحيح أو منتهي الصلاحية");
      }

      return ok({ verified: true });
    } catch (error) {
      return serviceError(OtpUseCase.SCOPE, "check", error, "حدث خطأ أثناء التحقق من الرمز");
    }
  }
}

export default OtpUseCase;
