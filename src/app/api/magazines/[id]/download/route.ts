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

    await prisma.monthlyMagazine.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    logger.info("API", "POST /magazines/[id]/download", `magazineId=${id}`);
    return toResponse(ok(null));
  } catch (error) {
    return apiError("API", "POST /magazines/[id]/download", error);
  }
}
