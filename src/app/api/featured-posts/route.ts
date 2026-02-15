import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import type { CreateFeaturedPostRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    logger.info("API", "GET /featured-posts", "Fetching all");
    return toResponse(await providers.featuredPost().getAll());
  } catch (error) {
    return apiError("API", "GET /featured-posts", error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const body = await parseJson<CreateFeaturedPostRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "POST /featured-posts", `admin=${auth.session.user.id}`);
    return toResponse(await providers.featuredPost().create(body), 201);
  } catch (error) {
    return apiError("API", "POST /featured-posts", error);
  }
}
