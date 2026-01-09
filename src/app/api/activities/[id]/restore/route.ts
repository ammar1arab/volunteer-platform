import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ActivityService from "@/core/application/services/ActivityService";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildService = () => new ActivityService(new ActivityRepository());

export async function POST(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const role = session.user.role as string;
  if (role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Only admins can restore activities" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const service = buildService();
  const result = await service.restore(id);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}