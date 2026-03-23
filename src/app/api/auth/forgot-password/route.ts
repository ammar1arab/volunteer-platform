import { NextResponse } from "next/server";
import { providers } from "@/lib/providers";
import { parseJson, badRequest, apiError, csrfCheck } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<{ email: string }>(req);
    if (!body?.email) return badRequest("email is required");
    return NextResponse.json(await providers.auth().forgotPassword(body));
  } catch (error) {
    return apiError("API", "POST /auth/forgot-password", error);
  }
}
