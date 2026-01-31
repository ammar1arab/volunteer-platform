import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/core/domain/enums";
import { ROUTES } from "@/lib";

interface TokenWithRole {
  role?: UserRole;
  sub?: string;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenWithRole | null;

  const isAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.SIGNUP;
  const isAdminRoute = pathname.startsWith(ROUTES.ADMIN.ROOT);
  const isVolunteerRoute = pathname.startsWith(ROUTES.VOLUNTEER.ROOT);

  const url = req.nextUrl.clone();

  if (isAuthPage && token?.role) {
    url.pathname = ROUTES.redirectByRole(token.role);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    if (!token?.role) {
      url.pathname = ROUTES.LOGIN;
      return NextResponse.redirect(url);
    }

    if (token.role !== UserRole.ADMIN) {
      url.pathname = ROUTES.redirectByRole(token.role);
      return NextResponse.redirect(url);
    }
  }

  if (isVolunteerRoute && !token?.role) {
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/admin/:path*", "/volunteer/:path*"],
};