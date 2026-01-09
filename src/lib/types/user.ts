import { UserRole } from "@/core/domain/enums";
import { VolunteerProfile } from "./volunteerProfile";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  volunteerProfile?: VolunteerProfile | null;
}