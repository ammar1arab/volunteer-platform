import { UserRole } from "@/core/domain/enums";

export interface UserProps {
  id?: string;
  createdAt?: Date;
  isActive?: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}