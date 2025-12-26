import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ActivityParticipationService from "@/core/application/services/ActivityParticipationService";
import {
  ActivityParticipationRepository,
  ActivityRepository,
  UserRepository,
} from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildService = () =>
  new ActivityParticipationService(
    new ActivityParticipationRepository(),
    new ActivityRepository(),
    new UserRepository()
  );

const statusFromError = (error?: string) => {
  const msg = (error || "").toLowerCase();
  if (!msg) return 400;
  if (msg.includes("not found")) return 404;
  if (msg.includes("required")) return 400;
  if (msg.includes("full")) return 409;
  if (msg.includes("only pending")) return 400;
  return 400;
};

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
      { success: false, error: "Only admins can approve requests" },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  const service = buildService();
  const result = await service.approve(id);

  return NextResponse.json(result, {
    status: result.success ? 200 : statusFromError(result.error),
  });
}