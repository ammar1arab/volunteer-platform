import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { unauthorized, badRequest, apiError } from "@/lib/api-utils";
import { R2StorageService } from "@/infrastructure/external";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorized();

    const key = req.nextUrl.searchParams.get("key");
    if (!key) return badRequest("Missing key");

    if (!key.startsWith("certificates/")) return new Response("Forbidden", { status: 403 });

    const storage   = new R2StorageService();
    const signedUrl = await storage.getPresignedDownloadUrl(key);

    return Response.json({ url: signedUrl });
  } catch (error) {
    return apiError("API", "GET /download", error);
  }
}