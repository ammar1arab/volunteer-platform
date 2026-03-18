import { providers } from "@/lib/providers";
import { parseJson, apiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await parseJson<{ email: string }>(req);
    if (!body?.email) return NextResponse.json({ needsVerification: false });
    return NextResponse.json(await providers.auth().checkVerified(body.email));
  } catch (error) {
    return apiError("API", "POST /auth/check-verified", error);
  }
}