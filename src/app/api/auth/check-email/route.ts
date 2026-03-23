import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/prisma";
import { parseJson, apiError, csrfCheck, checkRateLimit } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`check-email:${ip}`, 20, 60_000))
      return NextResponse.json({ taken: false }, { status: 429 });

    const body = await parseJson<{ email: string }>(req);
    if (!body?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
      return NextResponse.json({ taken: false });

    const user = await prisma.user.findUnique({
      where:  { email: body.email.toLowerCase() },
      select: { id: true },
    });

    return NextResponse.json(
      { taken: !!user },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError("API", "POST /auth/check-email", error);
  }
}