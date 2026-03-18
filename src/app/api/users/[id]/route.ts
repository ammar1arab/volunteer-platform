import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, requirePermission, forbidden, parseJson, apiError } from "@/lib/api-utils";
import { UserRole } from "@/core/domain/enums";
import type { UpdateUserRequest } from "@/core/application/dtos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;
    const { id } = await ctx.params;
    if (auth.session.user.role !== UserRole.ADMIN && auth.session.user.id !== id) {
      return forbidden();
    }
    logger.info("API", "GET /users/[id]", `requester=${auth.session.user.id} target=${id}`);
    return toResponse(await providers.user().getUserDetails(id));
  } catch (error) {
    return apiError("API", "GET /users/[id]", error);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requirePermission(req, "MANAGE_USERS");
    if ("error" in auth) return auth.error;
    const { id } = await ctx.params;
    const body = await parseJson<UpdateUserRequest & { permissions?: string[] }>(req);
    if (!body) return toResponse({ success: false, error: { code: "BAD_REQUEST", message: "Invalid body" } });
    if (body.permissions !== undefined) {
      if (!auth.session.user.isSuperAdmin) return forbidden("فقط السوبر أدمن يمكنه تعديل الصلاحيات");
      logger.info("API", "PATCH /users/[id]", `permissions update by=${auth.session.user.id} target=${id}`);
      return toResponse(await providers.user().updatePermissions(auth.session.user.id, id, body.permissions));
    }
    logger.info("API", "PATCH /users/[id]", `info update by=${auth.session.user.id} target=${id}`);
    return toResponse(await providers.user().updateBasicInfo(id, body));
  } catch (error) {
    return apiError("API", "PATCH /users/[id]", error);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;
    if (!auth.session.user.isSuperAdmin) return forbidden("فقط السوبر أدمن يمكنه حذف الأدمن");
    const { id } = await ctx.params;
    logger.info("API", "DELETE /users/[id]", `delete by=${auth.session.user.id} target=${id}`);
    return toResponse(await providers.user().deleteUser(id));
  } catch (error) {
    return apiError("API", "DELETE /users/[id]", error);
  }
}