import { UserRole } from "@/core/domain/enums";
import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError, forbidden, parseJson } from "@/lib/api-utils";
import { CreateAdminRequest } from "@/core/application/dtos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /users", `admin=${auth.session.user.id}`);
    return toResponse(await providers.user().getAllWithAnalytics());
  } catch (error) {
    return apiError("API", "GET /users", error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;
    if (!auth.session.user.isSuperAdmin) return forbidden("فقط السوبر أدمن يمكنه إنشاء أدمن جديد");

    const body = await parseJson<CreateAdminRequest>(req);
    if (!body) return toResponse({ success: false, error: { code: "BAD_REQUEST", message: "Invalid body" } });

    logger.info("API", "POST /users", `create admin by=${auth.session.user.id}`);
    return toResponse(await providers.user().createAdmin(auth.session.user.id, body), 201);
  } catch (error) {
    return apiError("API", "POST /users", error);
  }
}
