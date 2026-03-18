import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/core/domain/enums";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    profilePictureUrl?: string | null;
    isSuperAdmin: boolean;
    permissions: string[];
    tokenVersion: number;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
      profilePictureUrl?: string | null;
      isSuperAdmin: boolean;
      permissions: string[];
      tokenVersion: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    profilePictureUrl?: string | null;
    isSuperAdmin: boolean;
    permissions: string[];
    tokenVersion: number;
  }
}
