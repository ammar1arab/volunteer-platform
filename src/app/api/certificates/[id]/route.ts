import { providers } from "@/lib/providers";
import { toResponse, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    logger.info("API", "GET /certificates/[id]", id);
    return toResponse(await providers.certificate().getById(id));
  } catch (error) {
    return apiError("API", "GET /certificates/[id]", error);
  }
}