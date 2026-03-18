import { BaseEntityProps } from "./BaseEntityProps";
import { UserRole } from "@/core/domain/enums";

export interface UserProps extends BaseEntityProps {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  emailVerified?: boolean;
  tokenVersion?: number;
  isSuperAdmin?: boolean;
  permissions?: string[];
}
