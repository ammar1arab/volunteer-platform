import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/core/domain/enums";
import {
  ROUTES,
  redirectByRole,
  getRequiredPermission,
  getFirstAllowedAdminRoute,
} from "./presentation/constants";

interface TokenWithRole {
  role?: UserRole;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenWithRole | null;

  const isAuthPage       = pathname === ROUTES.LOGIN || pathname === ROUTES.SIGNUP;
  const isAdminRoute     = pathname.startsWith(ROUTES.ADMIN.ROOT);
  const isVolunteerRoute = pathname.startsWith(ROUTES.VOLUNTEER.ROOT);
  const url              = req.nextUrl.clone();

  const to = (dest: string) => {
    url.pathname = dest;
    return NextResponse.redirect(url);
  };

  if (isAuthPage) {
    if (!token?.role) return NextResponse.next();
    return to(redirectByRole(token.role));
  }

  if (isAdminRoute) {
    if (!token?.role) return to(ROUTES.LOGIN);
    if (token.role !== UserRole.ADMIN) return to(redirectByRole(token.role));

    if (token.isSuperAdmin) {
      if (pathname === ROUTES.ADMIN.ROOT) return to(ROUTES.ADMIN.FEATURED_POSTS);
      return NextResponse.next();
    }

    const permissions = token.permissions ?? [];

    if (pathname === ROUTES.ADMIN.ROOT) {
      const first = getFirstAllowedAdminRoute(permissions);
      if (!first) return to(ROUTES.HOME);
      return to(first);
    }

    if (pathname === ROUTES.ADMIN.PERMISSIONS || pathname.startsWith(`${ROUTES.ADMIN.PERMISSIONS}/`)) {
      return to(getFirstAllowedAdminRoute(permissions) ?? ROUTES.HOME);
    }

    const required = getRequiredPermission(pathname);
    if (required && !permissions.includes(required)) {
      const first = getFirstAllowedAdminRoute(permissions);
      if (!first) return to(ROUTES.HOME);
      return to(first);
    }

    return NextResponse.next();
  }

  if (isVolunteerRoute && !token?.role) return to(ROUTES.LOGIN);

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/admin/:path*", "/volunteer/:path*"],
};