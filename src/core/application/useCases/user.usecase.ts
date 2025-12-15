import { UserRepository } from "@/infrastructure/persistence/repositories";
import { Password } from "@/core/domain/valueObjects";
import { SignInRequest } from "../../dtos/authDto/signInRequest.dto";
import { SignInResponse } from "../../dtos/authDto/signIn.dto";

class SignInUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: SignInRequest): Promise<SignInResponse> {
    try {
      const user = await this.userRepository.findByEmail(dto.email);

      if (!user) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      if (!user.isActiveAccount()) {
        return {
          success: false,
          error: "Account is not active",
        };
      }

      const password = Password.fromHash(user.password);
      const isValidPassword = await password.compare(dto.password);

      if (!isValidPassword) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      // Success
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        success: true,
      };
    } catch {
      console.error("SignIn error: ");
      return {
        success: false,
        error: "An error occurred during sign in",
      };
    }
  }
}

export default SignInUseCase;
