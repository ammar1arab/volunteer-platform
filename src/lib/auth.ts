import type { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  UserRepository,
  VolunteerProfileRepository,
} from "@/infrastructure/persistence/repositories";

import { AuthService } from "@/core/application/services";
import { UserRole } from "@/core/domain/enums";
import { ROUTES } from "@/lib";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    name?: string | null;
    email?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: ROUTES.LOGIN,
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email ?? "";
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        const authService = new AuthService(
          new UserRepository(),
          new VolunteerProfileRepository(),
        );

        const result = await authService.signIn({ email, password });

        if (!result.success || !result.user) return null;

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.fullName,
          role: result.user.role as UserRole,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as any).role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token as any).role as UserRole;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};