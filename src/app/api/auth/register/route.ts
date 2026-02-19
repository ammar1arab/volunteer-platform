import { logger } from "@/lib/utils";
import { SignUpRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { toResponse, parseJson, badRequest, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await parseJson<SignUpRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "POST /auth/register", `email=${body.email}`);
    return toResponse(await providers.auth().signUp(body), 201);
  } catch (error) {
    return apiError("API", "POST /auth/register", error);
  }
}
