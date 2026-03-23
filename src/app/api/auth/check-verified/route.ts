import { NextResponse } from "next/server";
import { providers } from "@/lib/providers";
import { parseJson, apiError, csrfCheck } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<{ email: string }>(req);
    if (!body?.email) return NextResponse.json({ needsVerification: false });
    return NextResponse.json(await providers.auth().checkVerified(body.email));
  } catch (error) {
    return apiError("API", "POST /auth/check-verified", error);
  }
}
