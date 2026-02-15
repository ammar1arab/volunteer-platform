import { UserRepository, VolunteerProfileRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";
import { User, VolunteerProfile } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { Email } from "@/core/domain/valueObjects";
import { ok, fail, serviceError, logger } from "@/core/application/helpers";
import type { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from "@/core/application/dtos";

class AuthService {
  private static readonly SCOPE = "AuthService";

  constructor(
    private userRepository: UserRepository,
    private volunteerProfileRepository: VolunteerProfileRepository,
  ) {}

  async signIn(dto: SignInRequest): Promise<SignInResponse> {
    try {
      const emailStr = InputSanitizer.sanitizeEmail(dto.email);

      if (!SecurityValidator.isValidEmail(emailStr)) {
        return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");
      }

      const user = await this.userRepository.findByEmail(emailStr);
      if (!user) return fail("INVALID_CREDENTIALS", "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      if (!user.isActiveAccount()) return fail("FORBIDDEN", "الحساب غير مفعل");

      let isValid = false;

      if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
        try {
          const bcrypt = require("bcryptjs");
          isValid = await bcrypt.compare(dto.password, user.password);

          if (isValid) {
            const updatedUser = new User({ ...user.toObject(), password: dto.password });
            await this.userRepository.update(updatedUser);
            logger.info(AuthService.SCOPE, "signIn", `Migrated bcrypt password for user: ${user.id}`);
          }
        } catch (err) {
          logger.error(AuthService.SCOPE, "signIn", `Bcrypt comparison failed: ${err}`);
        }
      } else {
        isValid = user.password === dto.password;
      }

      if (!isValid) return fail("INVALID_CREDENTIALS", "البريد الإلكتروني أو كلمة المرور غير صحيحة");

      logger.info(AuthService.SCOPE, "signIn", `User signed in: ${user.id}`);

      return ok({
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      });
    } catch (error) {
      return serviceError(AuthService.SCOPE, "signIn", error, "حدث خطأ أثناء تسجيل الدخول");
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
        SecurityValidator.isValidDateOfBirth(dto.dateOfBirth),
      ];

      for (const v of validations) {
        if (!v.valid) return fail("VALIDATION_ERROR", v.message ?? "خطأ في التحقق");
      }

      if (!SecurityValidator.isValidEmail(emailStr)) {
        return fail("VALIDATION_ERROR", "البريد الإلكتروني غير صحيح");
      }

      const emailObj = new Email(emailStr);
      const existing = await this.userRepository.findByEmail(emailObj.getValue());
      if (existing) return fail("CONFLICT", "البريد الإلكتروني مستخدم مسبقاً");

      const user = User.create({
        email: emailObj.getValue(),
        password: dto.password,
        fullName,
        phone,
        role: UserRole.VOLUNTEER,
        isActive: true,
      });

      const createdUser = await this.userRepository.create(user);

      const profile = VolunteerProfile.create({
        userId: createdUser.id,
        city: dto.city,
        dateOfBirth: dto.dateOfBirth,
        profilePictureUrl: null,
        gender: null,
        bio: null,
        skills: [],
        interests: [],
        hasVolunteerExperience: false,
        isActive: true,
      });

      await this.volunteerProfileRepository.create(profile);

      logger.info(AuthService.SCOPE, "signUp", `User registered: ${createdUser.id}`);

      return ok({
        user: { id: createdUser.id, email: createdUser.email, fullName: createdUser.fullName },
      });
    } catch (error) {
      return serviceError(AuthService.SCOPE, "signUp", error, "حدث خطأ أثناء إنشاء الحساب");
    }
  }
}

export default AuthService;