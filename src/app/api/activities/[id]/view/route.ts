import { NextRequest } from "next/server";
import { toResponse, apiError } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await providers.activity().incrementViews(id);
    logger.info("API", "POST /activities/[id]/view", `activityId=${id}`);
    return toResponse(result);
  } catch (error) {
    return apiError("API", "POST /activities/[id]/view", error);
  }
}
