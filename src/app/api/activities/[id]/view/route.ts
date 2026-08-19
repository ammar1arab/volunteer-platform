import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/persistence/prisma";
import { toResponse, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";
import { ok } from "@/core/application/dtos";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.activity.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    logger.info("API", "POST /activities/[id]/view", `activityId=${id}`);
    return toResponse(ok(null));
  } catch (error) {
    return apiError("API", "POST /activities/[id]/view", error);
  }
}
