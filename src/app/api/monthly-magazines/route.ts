import { UserRole } from "@/core/domain/enums";
import { CreateMonthlyMagazineRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { apiError, badRequest, parseJson, requireAuth, toResponse } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    logger.info("API", "GET /monthly-magazines", "Fetching all");
    return toResponse(await providers.monthlyMagazine().getAll());
  } catch (error) {
    return apiError("API", "GET /monthly-magazines", error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const body = await parseJson<CreateMonthlyMagazineRequest>(req);
    if (!body) return badRequest("Invalid JSON body");

    logger.info("API", "POST /monthly-magazines", `admin=${auth.session.user.id}`);
    return toResponse(await providers.monthlyMagazine().create(body), 201);
  } catch (error) {
    return apiError("API", "POST /monthly-magazines", error);
  }
}
