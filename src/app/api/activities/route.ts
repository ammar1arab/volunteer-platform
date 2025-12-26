import { NextResponse } from "next/server";
import ActivityService from "@/core/application/services/ActivityService";
import type { CreateActivityRequest } from "@/core/application/dtos";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildService = () => new ActivityService(new ActivityRepository());

const statusFromError = (error?: string) => {
  const msg = (error || "").toLowerCase();
  if (!msg) return 400;
  if (msg.includes("not found")) return 404;
  if (msg.includes("id is required")) return 400;
  if (msg.includes("invalid") || msg.includes("required")) return 400;
  if (msg.includes("an error occurred")) return 500;
  return 400;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");

  const service = buildService();

  let result;
  if (filter === "published") {
    result = await service.getPublished();
  } else {
    result = await service.getAll();
  }

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: CreateActivityRequest;

  try {
    body = (await req.json()) as CreateActivityRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const service = buildService();
  const result = await service.create(body, session.user.id);

  return NextResponse.json(result, {
    status: result.success ? 201 : statusFromError(result.error),
  });
}