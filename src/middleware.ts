import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

interface TokenWithRole {
  role?: string;
  sub?: string;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenWithRole | null;

  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");
  const isAdminRoute = pathname.startsWith("/admin");
  const isVolunteerRoute = pathname.startsWith("/volunteer");

  if (isAuthPage && token) {
    const role = token.role;
    const url = req.nextUrl.clone();
    url.pathname = role === "ADMIN" ? "/admin/dashboard" : "/volunteer/profile";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    if (token.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/volunteer/profile";
      return NextResponse.redirect(url);
    }
  }

  if (isVolunteerRoute && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/admin/:path*", "/volunteer/:path*"],
};