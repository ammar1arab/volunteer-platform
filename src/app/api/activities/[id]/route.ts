import { UserRole } from "@/core/domain/enums";
import { logger } from "@/lib/utils";
import { UpdateActivityRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    logger.info("API", "GET /activities/[id]", id);
    return toResponse(await providers.activity().getOne(id));
  } catch (error) {
    return apiError("API", "GET /activities/[id]", error);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN); 
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const body = await parseJson<UpdateActivityRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "PUT /activities/[id]", `admin=${auth.session.user.id} id=${id}`);
    return toResponse(await providers.activity().update(id, body));
  } catch (error) {
    return apiError("API", "PUT /activities/[id]", error);
  }
}

export async function DELETE(req: Request, ctx: Ctx) { 
  try {
    const auth = await requireAuth(req, UserRole.ADMIN); 
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info("API", "DELETE /activities/[id]", `admin=${auth.session.user.id} id=${id}`);
    return toResponse(await providers.activity().delete(id));
  } catch (error) {
    return apiError("API", "DELETE /activities/[id]", error);
  }
}