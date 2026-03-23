import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { providers } from "@/lib/providers";
import { parseJson, badRequest, apiError, csrfCheck } from "@/lib/api-utils";
import type { ResetPasswordRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<ResetPasswordRequest>(req);
    if (!body?.resetToken || !body?.newPassword)
      return badRequest("resetToken and newPassword are required");

    // Verify short-lived reset token
    let email: string;
    try {
      const { payload } = await jwtVerify(body.resetToken, secret);
      if (payload.purpose !== "password-reset" || !payload.sub)
        return badRequest("رمز إعادة التعيين غير صحيح");
      email = payload.sub;
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TOKEN", message: "رمز إعادة التعيين غير صحيح أو منتهي الصلاحية" } },
        { status: 400 }
      );
    }

    return NextResponse.json(await providers.auth().resetPassword(email, body.newPassword));
  } catch (error) {
    return apiError("API", "POST /auth/reset-password", error);
  }
}