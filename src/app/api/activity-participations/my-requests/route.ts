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

export async function GET() {
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
      { success: false, error: "Only volunteers can access this" },
      { status: 403 }
    );
  }

  const service = buildService();
  const result = await service.getByVolunteer(session.user.id);

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}