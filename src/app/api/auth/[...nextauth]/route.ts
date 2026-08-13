import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/infrastructure/auth/config";

const nextAuthHandler = NextAuth(authOptions);

function bindDevAuthUrl(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return;
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  process.env.NEXTAUTH_URL = `${proto}://${host}`;
}

function handler(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  bindDevAuthUrl(req);
  return nextAuthHandler(req, ctx);
}

export { handler as GET, handler as POST };
