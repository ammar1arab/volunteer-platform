import { providers } from "@/lib/providers";
import { parseJson, badRequest, apiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";
import type { VerifyOtpRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await parseJson<VerifyOtpRequest>(req);
    if (!body?.email || !body?.code || !body?.type) return badRequest("email, code and type are required");
    return NextResponse.json(await providers.otp().verify(body));
  } catch (error) {
    return apiError("API", "POST /auth/verify-otp", error);
  }
}
