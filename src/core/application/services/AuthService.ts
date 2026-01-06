import { UserRepository, VolunteerProfileRepository } from "@/infrastructure/persistence/repositories";
import { InputSanitizer, SecurityValidator } from "@/infrastructure/security";
import { User, VolunteerProfile } from "@/core/domain/entities";
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

  constructor(
    private userRepository: UserRepository,
    private volunteerProfileRepository: VolunteerProfileRepository
  ) {}

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

      let isValid = false;

      // Check if password is bcrypt hashed
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        try {
          const bcrypt = require('bcryptjs');
          isValid = await bcrypt.compare(dto.password, user.password);
          
          // If valid, update to plain text
          if (isValid) {
            const userProps = user.toObject();
            const updatedUser = new User({
              ...userProps,
              password: dto.password,
            });
            await this.userRepository.update(updatedUser);
          }
        } catch (err) {
          console.error('bcrypt comparison failed:', err);
        }
      } else {
        // Plain text password
        isValid = user.password === dto.password;
      }

      if (!isValid) {
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
      // Sanitize inputs
      const fullName = InputSanitizer.sanitizeString(dto.fullName);
      const phone = InputSanitizer.sanitizePhone(dto.phone);
      const emailStr = InputSanitizer.sanitizeEmail(dto.email);

      // Validate full name
      const nameValidation = SecurityValidator.isValidName(fullName);
      if (!nameValidation.valid) {
        return { success: false, error: nameValidation.message };
      }

      // Validate email
      if (!SecurityValidator.isValidEmail(emailStr)) {
        return { success: false, error: "البريد الإلكتروني غير صحيح" };
      }

      // Validate password
      const passwordValidation = SecurityValidator.isValidPassword(dto.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Validate phone
      const phoneValidation = SecurityValidator.isValidPhone(phone);
      if (!phoneValidation.valid) {
        return { success: false, error: phoneValidation.message };
      }

      // Validate city
      const cityValidation = SecurityValidator.isValidCity(dto.city);
      if (!cityValidation.valid) {
        return { success: false, error: cityValidation.message };
      }

      // Validate date of birth
      const dobValidation = SecurityValidator.isValidDateOfBirth(dto.dateOfBirth);
      if (!dobValidation.valid) {
        return { success: false, error: dobValidation.message };
      }

      // Check if email already exists
      const emailObj = new Email(emailStr);
      const existingUser = await this.userRepository.findByEmail(emailObj.getValue());
      
      if (existingUser) {
        return { success: false, error: "البريد الإلكتروني مستخدم مسبقاً" };
      }

      // Create User entity
      const user = User.create({
        email: emailObj.getValue(),
        password: dto.password,
        fullName,
        phone,
        role: UserRole.VOLUNTEER,
        isActive: true,
      });

      // Save user to database
      const createdUser = await this.userRepository.create(user);

      // Create VolunteerProfile entity
      const volunteerProfile = VolunteerProfile.create({
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

      // Save volunteer profile to database
      await this.volunteerProfileRepository.create(volunteerProfile);

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
        "حدث خطأ أثناء إنشاء الحساب"
      );
    }
  }
}

export default AuthService;