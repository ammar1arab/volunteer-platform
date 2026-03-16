import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { providers } from "@/lib/providers";
import { ROUTES } from "@/presentation/constants/routes";
import { UserRole } from "@/core/domain/enums";
import { prisma } from "@/infrastructure/persistence/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: ROUTES.LOGIN },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email    = credentials?.email    ?? "";
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const result = await providers.auth().signIn({ email, password });
        if (!result.success || !result.data?.user) return null;

        const user = result.data.user;

        const profile = await prisma.volunteerProfile.findUnique({
          where: { userId: user.id },
          select: { profilePictureUrl: true }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role as UserRole,
          profilePictureUrl: profile?.profilePictureUrl ?? null
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role as UserRole;
        token.profilePictureUrl = user.profilePictureUrl ?? null;
      }
      // called when update() is triggered from the client
      if (trigger === "update" && sessionUpdate?.profilePictureUrl !== undefined) {
        token.profilePictureUrl = sessionUpdate.profilePictureUrl;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.profilePictureUrl = (token.profilePictureUrl as string) ?? null;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  }
};