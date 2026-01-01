import { NextResponse } from "next/server";
import FeaturedPostService from "@/core/application/services/FeaturedPostService";
import type { CreateFeaturedPostRequest } from "@/core/application/dtos";
import { FeaturedPostRepository } from "@/infrastructure/persistence/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buildService = () => new FeaturedPostService(new FeaturedPostRepository());

const statusFromError = (error?: string) => {
  const msg = (error || "").toLowerCase();
  if (!msg) return 400;
  if (msg.includes("not found")) return 404;
  if (msg.includes("id is required")) return 400;
  if (msg.includes("invalid") || msg.includes("required")) return 400;
  if (msg.includes("an error occurred")) return 500;
  return 400;
};

export async function GET() {
  const service = buildService();
  const result = await service.getAll();
  return NextResponse.json(result, { 
    status: result.success ? 200 : statusFromError(result.error) 
  });
}

export async function POST(req: Request) {
  let body: CreateFeaturedPostRequest;
  try {
    body = (await req.json()) as CreateFeaturedPostRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const service = buildService();
  const result = await service.create(body);
  return NextResponse.json(result, {
    status: result.success ? 201 : statusFromError(result.error),
  });
}