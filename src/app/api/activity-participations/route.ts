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
  if (msg.includes("unauthorized")) return 401;
  if (msg.includes("full")) return 409;
  if (msg.includes("already")) return 409;
  if (msg.includes("not published")) return 403;
  return 400;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const role = session.user.role as string;
  if (role !== "VOLUNTEER") {
    return NextResponse.json(
      { success: false, error: "Only volunteers can join activities" },
      { status: 403 }
    );
  }

  let body: { activityId: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.activityId?.trim()) {
    return NextResponse.json(
      { success: false, error: "Activity ID is required" },
      { status: 400 }
    );
  }

  const service = buildService();
  const result = await service.createJoinRequest(
    body.activityId,
    session.user.id
  );

  return NextResponse.json(result, {
    status: result.success ? 201 : statusFromError(result.error),
  });
}