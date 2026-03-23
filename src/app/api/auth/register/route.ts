import { providers } from "@/lib/providers";
import { toResponse, parseJson, badRequest, apiError, csrfCheck } from "@/lib/api-utils";
import { logger } from "@/lib/utils";
import { SignUpRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const csrf = csrfCheck(req);
  if (csrf) return csrf;

  try {
    const body = await parseJson<SignUpRequest>(req);
    if (!body) return badRequest("بيانات غير صالحة");
    logger.info("API", "POST /auth/register", `email=${body.email}`);
    return toResponse(await providers.auth().signUp(body), 201);
  } catch (error) {
    return apiError("API", "POST /auth/register", error);
  }
}
