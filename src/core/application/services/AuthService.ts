import { UserRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";
import { User } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { Email } from "@/core/domain/valueObjects";
import { serviceError } from "@/core/application/helpers";
import type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from "@/core/application/dtos";

class AuthService {
  private static readonly SCOPE = "AuthService";

  constructor(private userRepository: UserRepository) {}

  async signIn(dto: SignInRequest): Promise<SignInResponse> {
    try {
      const emailStr = InputSanitizer.sanitizeEmail(dto.email);
      
      if (!SecurityValidator.isValidEmail(emailStr)) {
        return { success: false, error: "البريد الإلكتروني غير صحيح" };
      }

      const user = await this.userRepository.findByEmail(emailStr);
      
      if (!user) {
        return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
      }

      if (!user.isActiveAccount()) {
        return { success: false, error: "الحساب غير مفعل" };
      }

      if (user.password !== dto.password) {
        return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (error) {
      return serviceError<SignInResponse>(
        AuthService.SCOPE,
        "signIn",
        error,
        "حدث خطأ أثناء تسجيل الدخول"
      );
    }
  }

  async signUp(dto: SignUpRequest): Promise<SignUpResponse> {
    try {
      const fullName = InputSanitizer.sanitizeString(dto.fullName);
      const phone = InputSanitizer.sanitizePhone(dto.phone);

      const nameValidation = SecurityValidator.isValidName(fullName);
      if (!nameValidation.valid) {
        return { success: false, error: nameValidation.message };
      }

      if (!SecurityValidator.isValidEmail(dto.email)) {
        return { success: false, error: "البريد الإلكتروني غير صحيح" };
      }

      const passwordValidation = SecurityValidator.isValidPassword(dto.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      const phoneValidation = SecurityValidator.isValidPhone(phone);
      if (!phoneValidation.valid) {
        return { success: false, error: phoneValidation.message };
      }

      const emailObj = new Email(dto.email);
      const existingUser = await this.userRepository.findByEmail(emailObj.getValue());
      
      if (existingUser) {
        return { success: false, error: "البريد الإلكتروني مستخدم مسبقاً" };
      }

      const user = User.create({
        email: emailObj.getValue(),
        password: dto.password,
        fullName,
        phone,
        role: UserRole.VOLUNTEER,
        isActive: true,
      });

      const createdUser = await this.userRepository.create(user);

      return {
        success: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          fullName: createdUser.fullName,
        },
      };
    } catch (error) {
      return serviceError<SignUpResponse>(
        AuthService.SCOPE,
        "signUp",
        error,
        error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الحساب"
      );
    }
  }
}

export default AuthService;
