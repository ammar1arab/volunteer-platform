import { NextResponse } from "next/server";
import ActivityService from "@/core/application/services/ActivityService";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildService = () => new ActivityService(new ActivityRepository());

export async function POST(_: Request, ctx: { params: { id: string } }) {
  const service = buildService();
  const result = await service.cancel(ctx.params.id);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}