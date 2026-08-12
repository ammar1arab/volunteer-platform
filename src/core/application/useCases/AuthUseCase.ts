import { UserRepository, PendingRegistrationRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";
import { UserRole } from "@/core/domain/enums";
import { Email } from "@/core/domain/valueObjects";
import { serviceError } from "@/core/application/common";
import { OtpUseCase } from "@/core/application/useCases";
import { OtpType } from "@prisma/client";
import {
  ok,
  fail,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordResponse
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";

const PENDING_EXPIRY_MS = 24 * 60 * 60 * 1000;

class AuthUseCase {
  private static readonly SCOPE = "AuthUseCase";

  constructor(
    private userRepository: UserRepository,
    private otpUseCase: OtpUseCase,
    private pendingRepository: PendingRegistrationRepository
  ) {}

  async signIn(dto: SignInRequest): Promise<SignInResponse> {
    try {
      const emailStr = InputSanitizer.sanitizeEmail(dto.email);
      if (!SecurityValidator.isValidEmail(emailStr)) return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");

      const user = await this.userRepository.findByEmail(emailStr);
      if (!user) return fail("INVALID_CREDENTIALS", "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      if (!user.isActiveAccount()) return fail("FORBIDDEN", "الحساب غير مفعل");

      let isValid = false;
      if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
        try {
          const bcrypt = require("bcryptjs");
          isValid = await bcrypt.compare(dto.password, user.password);
          if (isValid) {
            user.updatePassword(dto.password);
            await this.userRepository.update(user);
            logger.info(AuthUseCase.SCOPE, "signIn", `Migrated bcrypt password for: ${user.id}`);
          }
        } catch (err) {
          logger.error(AuthUseCase.SCOPE, "signIn", `Bcrypt comparison failed: ${err}`);
        }
      } else {
        isValid = user.password === dto.password;
      }

      if (!isValid) return fail("INVALID_CREDENTIALS", "البريد الإلكتروني أو كلمة المرور غير صحيحة");

      if (user.role === UserRole.VOLUNTEER && !user.emailVerified) {
        await this.otpUseCase.send({ email: emailStr, type: OtpType.EMAIL_VERIFY });
        logger.info(AuthUseCase.SCOPE, "signIn", `OTP required for unverified user: ${user.id}`);
        return fail("EMAIL_NOT_VERIFIED", "يجب تفعيل بريدك الإلكتروني. تم إرسال رمز التحقق إلى بريدك");
      }

      logger.info(AuthUseCase.SCOPE, "signIn", `User signed in: ${user.id}`);
      return ok({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
    } catch (error) {
      return serviceError(AuthUseCase.SCOPE, "signIn", error, "حدث خطأ أثناء تسجيل الدخول");
    }
  }

  async signUp(dto: SignUpRequest): Promise<SignUpResponse> {
    try {
      const fullName = InputSanitizer.sanitizeString(dto.fullName);
      const phone = InputSanitizer.sanitizePhone(dto.phone);
      const emailStr = InputSanitizer.sanitizeEmail(dto.email);

      const validations = [
        SecurityValidator.isValidName(fullName),
        SecurityValidator.isValidPassword(dto.password),
        SecurityValidator.isValidPhone(phone),
        SecurityValidator.isValidCity(dto.city),
        SecurityValidator.isValidDateOfBirth(dto.dateOfBirth)
      ];
      for (const v of validations) {
        if (!v.valid) return fail("VALIDATION_ERROR", v.message ?? "خطأ في التحقق");
      }
      if (!SecurityValidator.isValidEmail(emailStr)) return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");

      const emailObj = new Email(emailStr);
      const existing = await this.userRepository.findByEmail(emailObj.getValue());
      if (existing) return fail("CONFLICT", "البريد الإلكتروني مستخدم مسبقاً");

      await this.pendingRepository.upsert(
        {
          email: emailObj.getValue(),
          password: dto.password,
          fullName,
          phone,
          city: dto.city,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender ?? null,
          membershipNumber: dto.membershipNumber
            ? InputSanitizer.sanitizeString(dto.membershipNumber) || null
            : null,
          educationLevel: dto.educationLevel
            ? InputSanitizer.sanitizeString(dto.educationLevel) || null
            : null,
          occupation: dto.occupation
            ? InputSanitizer.sanitizeString(dto.occupation) || null
            : null,
          languages: (dto.languages ?? []).map((l) => InputSanitizer.sanitizeString(l)).filter(Boolean),
          preferredVolunteerTypes: (dto.preferredVolunteerTypes ?? [])
            .map((t) => InputSanitizer.sanitizeString(t))
            .filter(Boolean),
          skills: (dto.skills ?? []).map((s) => InputSanitizer.sanitizeString(s)).filter(Boolean),
          interests: (dto.interests ?? []).map((i) => InputSanitizer.sanitizeString(i)).filter(Boolean),
          hasVolunteerExperience: dto.hasVolunteerExperience ?? false
        },
        new Date(Date.now() + PENDING_EXPIRY_MS)
      );

      await this.otpUseCase.send({ email: emailObj.getValue(), type: OtpType.EMAIL_VERIFY });

      logger.info(AuthUseCase.SCOPE, "signUp", `Pending registration saved for: ${emailObj.getValue()}`);
      return ok({ user: { id: "", email: emailObj.getValue(), fullName } });
    } catch (error) {
      return serviceError(AuthUseCase.SCOPE, "signUp", error, "حدث خطأ أثناء إنشاء الحساب");
    }
  }

  async forgotPassword(dto: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const emailStr = InputSanitizer.sanitizeEmail(dto.email);
      if (!SecurityValidator.isValidEmail(emailStr)) return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");

      const user = await this.userRepository.findByEmail(emailStr);


      if (!user || user.role !== UserRole.VOLUNTEER || !user.isActiveAccount()) {
        logger.info(AuthUseCase.SCOPE, "forgotPassword", `Account not found/inactive for: ${emailStr}`);
        return ok({ cooldownSeconds: 60 });
      }

      const result = await this.otpUseCase.send({ email: emailStr, type: OtpType.FORGOT_PASSWORD });
      if (!result.success) return result as ForgotPasswordResponse;

      logger.info(AuthUseCase.SCOPE, "forgotPassword", `OTP sent for: ${emailStr}`);
      return ok({ cooldownSeconds: result.data!.cooldownSeconds });
    } catch (error) {
      return serviceError(AuthUseCase.SCOPE, "forgotPassword", error, "حدث خطأ أثناء إرسال الرمز");
    }
  }


  async resetPassword(email: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const emailStr = InputSanitizer.sanitizeEmail(email);

      const passwordValidation = SecurityValidator.isValidPassword(newPassword);
      if (!passwordValidation.valid)
        return fail("VALIDATION_ERROR", passwordValidation.message ?? "كلمة المرور غير صالحة");

      const user = await this.userRepository.findByEmail(emailStr);
      if (!user) return fail("NOT_FOUND", "المستخدم غير موجود");

      user.updatePassword(newPassword);
      user.incrementTokenVersion();
      await this.userRepository.update(user);

      logger.info(AuthUseCase.SCOPE, "resetPassword", `Password reset for: ${user.id}`);
      return ok({ success: true });
    } catch (error) {
      return serviceError(AuthUseCase.SCOPE, "resetPassword", error, "حدث خطأ أثناء إعادة تعيين كلمة المرور");
    }
  }

  async checkVerified(email: string): Promise<{ needsVerification: boolean; message?: string }> {
    const emailStr = InputSanitizer.sanitizeEmail(email);
    const user = await this.userRepository.findByEmail(emailStr);

    if (!user || !user.isActiveAccount())
      return { needsVerification: false, message: "بريد إلكتروني أو كلمة مرور غير صحيحة" };
    if (user.role === UserRole.VOLUNTEER && !user.emailVerified) return { needsVerification: true };
    return { needsVerification: false, message: "بريد إلكتروني أو كلمة مرور غير صحيحة" };
  }
}

export default AuthUseCase;
