import { prisma } from "@/infrastructure/persistence/prisma";
import { parseJson, apiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await parseJson<{ email: string }>(req);
    if (!body?.email) return NextResponse.json({ taken: false });

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