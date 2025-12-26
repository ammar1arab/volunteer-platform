import { NextResponse } from "next/server";
import ActivityService from "@/core/application/services/ActivityService";
import type { UpdateActivityRequest } from "@/core/application/dtos";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";

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

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const service = buildService();
  const result = await service.getOne(id);

  return NextResponse.json(result, {
    status: result.success ? 200 : statusFromError(result.error),
  });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  let body: UpdateActivityRequest;

  try {
    body = (await req.json()) as UpdateActivityRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const service = buildService();
  const result = await service.update(id, body);

  return NextResponse.json(result, {
    status: result.success ? 200 : statusFromError(result.error),
  });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const service = buildService();
  const result = await service.delete(id);

  return NextResponse.json(result, {
    status: result.success ? 200 : statusFromError(result.error),
  });
}