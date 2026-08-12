import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { OtpType } from "@prisma/client";
import { providers } from "@/lib/providers";
import { parseJson, badRequest, apiError, csrfCheck } from "@/lib/api-utils";
import type { VerifyOtpRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<VerifyOtpRequest>(req);
    if (!body?.email || !body?.code || !body?.type) return badRequest("email, code and type are required");

    const result = await providers.otp().verify(body);
    if (!result.success) return NextResponse.json(result);


    if (body.type === OtpType.FORGOT_PASSWORD) {
      const resetToken = await new SignJWT({ purpose: "password-reset" })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(body.email)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(secret);

      return NextResponse.json({
        ...result,
        data: { ...result.data, resetToken }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return apiError("API", "POST /auth/verify-otp", error);
  }
}
