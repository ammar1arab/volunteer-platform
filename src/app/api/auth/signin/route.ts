import { SignJWT } from "jose";
import { providers } from "@/lib/providers";
import { parseJson, badRequest, toResponse, apiError, csrfCheck } from "@/lib/api-utils";
import type { SignInRequest, SignInTokenResponse } from "@/core/application/dtos";

export const runtime = "nodejs";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<SignInRequest>(req);
    if (!body) return badRequest("Invalid body");

    const result = await providers.auth().signIn(body);
    if (!result.success || !result.data?.user) return badRequest("Invalid credentials");

    const user = result.data.user;
    const token = await new SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const response: SignInTokenResponse = { success: true, data: { token, user } };
    return toResponse(response);
  } catch (error) {
    return apiError("API", "POST /auth/signin", error);
  }
}
