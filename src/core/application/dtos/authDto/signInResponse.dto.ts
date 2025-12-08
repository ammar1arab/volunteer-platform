import { UserRole } from "@prisma/client";

export interface SignInResponse {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  success: boolean;
  error?: string;
}
