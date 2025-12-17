import { UserRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";

import { User } from "@/core/domain/entities";
import { UserRole } from "@/core/domain/enums";
import { Password } from "@/core/domain/valueObjects";

import type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from "../dtos";


class AuthService {
  constructor(private userRepository: UserRepository) {}

  // ========== SIGN IN ==========
  async signIn(dto: SignInRequest): Promise<SignInResponse> {
    try {
      // 1. Sanitize input
      const email = InputSanitizer.sanitizeEmail(dto.email);

      // 2. Validate format
      if (!SecurityValidator.isValidEmail(email)) {
        return { success: false, error: "Invalid email format" };
      }

      // 3. Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      // 4. Check account active
      if (!user.isActiveAccount()) {
        return { success: false, error: "Account is not active" };
      }

      // 5. Compare password
      const password = Password.fromHash(user.password);
      const isValid = await password.compare(dto.password);

      if (!isValid) {
        return { success: false, error: "Invalid email or password" };
      }

      // 6. Return success
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
      console.error("SignIn error:", error);
      return { success: false, error: "An error occurred during sign in" };
    }
  }

  // ========== SIGN UP ==========
  async signUp(dto: SignUpRequest): Promise<SignUpResponse> {
    try {
      // 1. Sanitize input
      const email = InputSanitizer.sanitizeEmail(dto.email);
      const phone = InputSanitizer.sanitizePhone(dto.phone);
      const fullName = InputSanitizer.sanitizeString(dto.fullName);

      // 2. Validate format
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

      // 3. Check if email exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return { success: false, error: "Email already registered" };
      }

      // 4. Hash password
      const hashedPassword = await Password.create(dto.password);

      // 5. Create user entity
      const user = User.create({
        email,
        password: hashedPassword.getValue(),
        fullName,
        phone,
        role: UserRole.VOLUNTEER,
        isActive: true,
      });

      // 6. Save to database
      const createdUser = await this.userRepository.create(user);

      // 7. Return success
      return {
        success: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          fullName: createdUser.fullName,
        },
      };
    } catch (error) {
      console.error("SignUp error:", error);
      return { success: false, error: "An error occurred during sign up" };
    }
  }
}

export default AuthService;
