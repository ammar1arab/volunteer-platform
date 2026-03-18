import { providers } from "@/lib/providers";
import { parseJson, badRequest, apiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";
import type { ResetPasswordRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await parseJson<ResetPasswordRequest>(req);
    if (!body?.email || !body?.code || !body?.newPassword)
      return badRequest("email, code and newPassword are required");
    return NextResponse.json(await providers.auth().resetPassword(body));
  } catch (error) {
    return apiError("API", "POST /auth/reset-password", error);
  }
}