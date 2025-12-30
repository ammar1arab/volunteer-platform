import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRepository } from "@/infrastructure/persistence/repositories";
import AuthService from "@/core/application/services/AuthService";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ExtendedToken {
  sub?: string;
  role?: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
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

        const authService = new AuthService(new UserRepository());
        const result = await authService.signIn({ email, password });

        if (!result.success || !result.user) return null;

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.fullName,
          role: result.user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        const extendedToken = token as ExtendedToken;
        token.sub = authUser.id;
        extendedToken.role = authUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const extendedToken = token as ExtendedToken;
        session.user.id = token.sub ?? "";
        session.user.role = extendedToken.role ?? "";
      }
      return session;
    },
  },
};