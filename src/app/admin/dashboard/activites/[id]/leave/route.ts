import { NextResponse } from "next/server";
import ActivityService from "@/core/application/services/ActivityService";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildService = () => new ActivityService(new ActivityRepository());

export async function POST(_: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const service = buildService();
  const result = await service.leaveActivity(ctx.params.id);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}