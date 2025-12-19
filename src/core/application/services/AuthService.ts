import { UserRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";

import { User } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { Password } from "@/core/domain/valueObjects";
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
      const email = InputSanitizer.sanitizeEmail(dto.email);

      if (!SecurityValidator.isValidEmail(email)) {
        return { success: false, error: "Invalid email format" };
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      if (!user.isActiveAccount()) {
        return { success: false, error: "Account is not active" };
      }

      const password = Password.fromHash(user.password);
      const isValid = await password.compare(dto.password);

      if (!isValid) {
        return { success: false, error: "Invalid email or password" };
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
        "An error occurred during sign in"
      );
    }
  }

  async signUp(dto: SignUpRequest): Promise<SignUpResponse> {
    try {
      const email = InputSanitizer.sanitizeEmail(dto.email);
      const phone = InputSanitizer.sanitizePhone(dto.phone);
      const fullName = InputSanitizer.sanitizeString(dto.fullName);

      if (!SecurityValidator.isValidEmail(email)) {
        return { success: false, error: "Invalid email format" };
      }

      if (!SecurityValidator.isStrongPassword(dto.password)) {
        return {
          success: false,
          error:
            "Password must be at least 8 characters with uppercase, lowercase, and number",
        };
      }

      if (!SecurityValidator.isValidJordanianPhone(phone)) {
        return {
          success: false,
          error: "Invalid phone number. Must be 07XXXXXXXX",
        };
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return { success: false, error: "Email already registered" };
      }

      const hashedPassword = await Password.create(dto.password);

      const user = User.create({
        email,
        password: hashedPassword.getValue(),
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
        "An error occurred during sign up"
      );
    }
  }
}

export default AuthService;
