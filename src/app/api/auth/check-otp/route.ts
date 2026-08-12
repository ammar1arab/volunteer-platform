import { NextResponse } from "next/server";
import { providers } from "@/lib/providers";
import { parseJson, badRequest, apiError, csrfCheck } from "@/lib/api-utils";
import type { VerifyOtpRequest } from "@/core/application/dtos";

export const runtime = "nodejs";



export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<VerifyOtpRequest>(req);
    if (!body?.email || !body?.code || !body?.type) return badRequest("email, code and type are required");
    return NextResponse.json(await providers.otp().check(body));
  } catch (error) {
    return apiError("API", "POST /auth/check-otp", error);
  }
}
