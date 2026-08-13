"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/core/domain/enums";
import { ROUTES, redirectByRole } from "@/presentation/constants";

interface UseAuthOptions {
  requireAuth?: boolean;
  requireRole?: UserRole;
  redirectTo?: string;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const { data: session, status } = useSession();
  const {
    requireAuth = true,
    requireRole,
    redirectTo = ROUTES.LOGIN
  } = options;

  const role = session?.user?.role;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  let href: string | null = null;
  if (!isLoading) {
    if (requireAuth && status === "unauthenticated") {
      href = redirectTo;
    } else if (requireRole && role && role !== requireRole) {
      href = redirectByRole(role);
    }
  }

  if (href && typeof window !== "undefined") {
    window.location.replace(href);
  }

  return {
    session,
    status: href ? ("loading" as const) : status,
    isLoading: isLoading || Boolean(href),
    isAuthenticated,
    user: session?.user,
    role
  };
};
