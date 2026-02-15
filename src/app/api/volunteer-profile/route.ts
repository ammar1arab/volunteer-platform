import { logger } from "@/core/application/helpers";
import type { UpdateVolunteerProfileRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET(req: Request) {  
  try {
    const auth = await requireAuth(req); 
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /volunteer-profile", `user=${auth.session.user.id}`);
    return toResponse(await providers.volunteerProfile().getProfile(auth.session.user.id));
  } catch (error) {
    return apiError("API", "GET /volunteer-profile", error);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const body = await parseJson<Omit<UpdateVolunteerProfileRequest, "userId">>(req);
    if (!body) return badRequest("Invalid JSON body");

    const dto: UpdateVolunteerProfileRequest = { ...body, userId: auth.session.user.id };

    logger.info("API", "PATCH /volunteer-profile", `user=${auth.session.user.id}`);
    return toResponse(await providers.volunteerProfile().updateProfile(dto));
  } catch (error) {
    return apiError("API", "PATCH /volunteer-profile", error);
  }
}