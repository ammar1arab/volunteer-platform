import { providers } from "@/lib/providers";
import { parseJson, toResponse, badRequest, apiError, csrfCheck } from "@/lib/api-utils";
import type { SendOtpRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<SendOtpRequest>(req);
    if (!body?.email || !body?.type) return badRequest("email and type are required");
    return toResponse(await providers.otp().send(body));
  } catch (error) {
    return apiError("API", "POST /auth/send-otp", error);
  }
}
