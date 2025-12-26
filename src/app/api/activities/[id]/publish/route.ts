import { NextResponse } from "next/server";
import ActivityService from "@/core/application/services/ActivityService";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildService = () => new ActivityService(new ActivityRepository());

export async function POST(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const service = buildService();
  const result = await service.publish(id);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}