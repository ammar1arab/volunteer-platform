import { UserRole } from "@/core/domain/enums";
import { UpdateMonthlyMagazineRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { apiError, badRequest, parseJson, requireAuth, toResponse } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    logger.info("API", "GET /monthly-magazines/[id]", id);
    return toResponse(await providers.monthlyMagazine().getOne(id));
  } catch (error) {
    return apiError("API", "GET /monthly-magazines/[id]", error);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const body = await parseJson<UpdateMonthlyMagazineRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "PUT /monthly-magazines/[id]", `admin=${auth.session.user.id} id=${id}`);
    return toResponse(await providers.monthlyMagazine().update(id, body));
  } catch (error) {
    return apiError("API", "PUT /monthly-magazines/[id]", error);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info("API", "DELETE /monthly-magazines/[id]", `admin=${auth.session.user.id} id=${id}`);
    return toResponse(await providers.monthlyMagazine().delete(id));
  } catch (error) {
    return apiError("API", "DELETE /monthly-magazines/[id]", error);
  }
}