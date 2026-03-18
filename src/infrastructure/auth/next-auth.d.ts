import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import type { UserRole } from "@/core/domain/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      profilePictureUrl: string | null;
      isSuperAdmin: boolean;
      permissions: string[];
      tokenVersion: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    profilePictureUrl: string | null;
    isSuperAdmin: boolean;
    permissions: string[];
    tokenVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    profilePictureUrl: string | null;
    isSuperAdmin: boolean;
    permissions: string[];
    tokenVersion: number;
  }
}
