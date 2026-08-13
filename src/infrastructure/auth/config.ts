import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
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
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email    = credentials?.email    ?? "";
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const result = await providers.auth().signIn({ email, password });
        if (!result.success) return null;

        const user = result.data!.user;

        const [profile, dbUser] = await Promise.all([
          prisma.volunteerProfile.findUnique({
            where:  { userId: user.id },
            select: { profilePictureUrl: true },
          }),
          prisma.user.findUnique({
            where:  { id: user.id },
            select: { isSuperAdmin: true, permissions: true, tokenVersion: true },
          }),
        ]);

        return {
          id:                user.id,
          email:             user.email,
          name:              user.fullName,
          role:              user.role as UserRole,
          profilePictureUrl: profile?.profilePictureUrl ?? null,
          isSuperAdmin:      dbUser?.isSuperAdmin  ?? false,
          permissions:       dbUser?.permissions   ?? [],
          tokenVersion:      dbUser?.tokenVersion  ?? 0,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token.id                = user.id;
        token.role              = user.role as UserRole;
        token.profilePictureUrl = user.profilePictureUrl ?? null;
        token.isSuperAdmin      = user.isSuperAdmin;
        token.permissions       = user.permissions;
        token.tokenVersion      = user.tokenVersion;
      }

      if (trigger === "update" && sessionUpdate?.profilePictureUrl !== undefined) {
        token.profilePictureUrl = sessionUpdate.profilePictureUrl;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { tokenVersion: true },
        });

        if (dbUser && dbUser.tokenVersion > (token.tokenVersion as number)) {
          return { ...token, id: "" };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.id) {
        return {
          ...session,
          user: {
            ...session.user,
            id: "",
            role: UserRole.VOLUNTEER,
            profilePictureUrl: null,
            isSuperAdmin: false,
            permissions: [],
            tokenVersion: 0
          }
        };
      }

      if (session.user) {
        session.user.id                = token.id as string;
        session.user.role              = token.role as UserRole;
        session.user.profilePictureUrl = (token.profilePictureUrl as string) ?? null;
        session.user.isSuperAdmin      = token.isSuperAdmin as boolean;
        session.user.permissions       = token.permissions as string[];
        session.user.tokenVersion      = token.tokenVersion as number;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};