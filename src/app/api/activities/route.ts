import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import type { CreateActivityRequest } from "@/core/application/dtos";
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

export async function GET(req: Request) {
  try {
    const filter = new URL(req.url).searchParams.get("filter");
    const service = providers.activity();

    let result;
    if (filter === "published") {
      result = await service.getPublished();
    } else {
      const auth = await requireAuth(req, UserRole.ADMIN); 
      if ("error" in auth) return auth.error;
      result = await service.getAll();
    }

    logger.info(
      "API",
      "GET /activities",
      `filter=${filter ?? "all"} count=${result.success ? result.data.activities.length : 0}`,
    );
    return toResponse(result);
  } catch (error) {
    return apiError("API", "GET /activities", error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const body = await parseJson<CreateActivityRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "POST /activities", `admin=${auth.session.user.id}`);
    return toResponse(
      await providers.activity().create(body, auth.session.user.id),
      201,
    );
  } catch (error) {
    return apiError("API", "POST /activities", error);
  }
}
