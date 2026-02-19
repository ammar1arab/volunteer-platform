import { logger } from "@/lib/utils";
import { UpdateUserRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /users/me", `user=${auth.session.user.id}`);
    return toResponse(await providers.user().getUserDetails(auth.session.user.id));
  } catch (error) {
    return apiError("API", "GET /users/me", error);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const body = await parseJson<UpdateUserRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "PATCH /users/me", `user=${auth.session.user.id}`);
    return toResponse(await providers.user().updateBasicInfo(auth.session.user.id, body));
  } catch (error) {
    return apiError("API", "PATCH /users/me", error);
  }
}
