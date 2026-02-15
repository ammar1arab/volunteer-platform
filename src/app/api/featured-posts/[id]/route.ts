import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import type { UpdateFeaturedPostRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import {
  toResponse,
  requireAuth,
  parseJson,
  badRequest,
  apiError,
} from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// ✅ Public - No auth required
export async function GET(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    logger.info("API", "GET /featured-posts/[id]", id);
    return toResponse(await providers.featuredPost().getOne(id));
  } catch (error) {
    return apiError("API", "GET /featured-posts/[id]", error);
  }
}

// ✅ Admin only
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const body = await parseJson<UpdateFeaturedPostRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info(
      "API",
      "PUT /featured-posts/[id]",
      `admin=${auth.session.user.id} id=${id}`,
    );
    return toResponse(await providers.featuredPost().update(id, body));
  } catch (error) {
    return apiError("API", "PUT /featured-posts/[id]", error);
  }
}

// ✅ Admin only
export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info(
      "API",
      "DELETE /featured-posts/[id]",
      `admin=${auth.session.user.id} id=${id}`,
    );
    return toResponse(await providers.featuredPost().delete(id));
  } catch (error) {
    return apiError("API", "DELETE /featured-posts/[id]", error);
  }
}
