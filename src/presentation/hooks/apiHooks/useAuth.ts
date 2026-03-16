"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/core/domain/enums";
import { ROUTES, redirectByRole } from "@/presentation/constants";

interface UseAuthOptions {
  requireAuth?: boolean;
  requireRole?: UserRole;
  redirectTo?: string;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    requireAuth = true,
    requireRole,
    redirectTo = ROUTES.LOGIN,
  } = options;

  useEffect(() => {
    if (status === "loading") return;

    if (requireAuth && status === "unauthenticated") {
      router.replace(redirectTo);
      return;
    }

    if (requireRole && session?.user?.role && session.user.role !== requireRole) {
      router.replace(redirectByRole(session.user.role));
    }
  }, [status, session, requireAuth, requireRole, redirectTo, router]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    role: session?.user?.role,
  };
};