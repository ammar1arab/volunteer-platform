import { UserRole } from "@/core/domain/enums";

export interface UserProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}
