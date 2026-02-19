import { providers } from "@/lib/providers";
import { apiError, badRequest, parseJson, requireAuth, toResponse } from "@/lib/api-utils";
import { UserRole } from "@/core/domain/enums";
import { UpdateVolunteerSpotlightRequest } from "@/core/application/dtos";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    logger.info("API", "GET /volunteer-spotlight/[i]", id);
    return toResponse(await providers.volunteerSpotlight().getOne(id));
  } catch (error) {
    return apiError("API", "GET /volunteer-spotlight/[id]", error);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const body = await parseJson<UpdateVolunteerSpotlightRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "PUT /volunteer-spotlight/[id]", `admin=${auth.session.user.id} id=${id}`);
    return toResponse(await providers.volunteerSpotlight().update(id, body));
  } catch (error) {
    return apiError("API", "PUT /volunteer-spotlight/[id]", error);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;

    logger.info("API", "DELETE /volunteer-spotlight/[id]", `admin=${auth.session.user.id} id=${id}`);
    return toResponse(await providers.volunteerSpotlight().delete(id));
  } catch (error) {
    return apiError("API", "DELETE /volunteer-spotlight/[id]", error);
  }
}
