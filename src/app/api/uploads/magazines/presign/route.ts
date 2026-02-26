import { ok } from "@/core/application/dtos";
import { UserRole } from "@/core/domain/enums";
import { R2StorageService } from "@/infrastructure/external";
import { requireAuth, toResponse } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = await requireAuth(req, UserRole.ADMIN);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName") ?? "file.pdf";

  const storage = new R2StorageService();
  const { url, key } = await storage.getPresignedUploadUrl("magazines", fileName, "application/pdf");

  return toResponse(ok({ presignedUrl: url, publicUrl: `${process.env.R2_PUBLIC_URL}/${key}` }));
}
