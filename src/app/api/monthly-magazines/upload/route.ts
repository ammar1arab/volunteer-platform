import { apiError, badRequest, requireAuth, toResponse, validateFile } from "@/lib/api-utils";
import { UserRole } from "@/core/domain/enums";
import { logger } from "@/lib/utils";
import { R2StorageService } from "@/infrastructure/external";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const fileError = validateFile(file, 20, "pdf"); 
    if (fileError) return badRequest(fileError);

    const buffer = Buffer.from(await file!.arrayBuffer());
    const storage = new R2StorageService();
    const result = await storage.upload(buffer, "magazines", file!.name);

    if (!result.success || !result.url) {
      return badRequest(result.error || "فشل رفع الملف");
    }

    logger.info("API", "POST /monthly-magazines/upload", `admin=${auth.session.user.id} url=${result.url}`);
    return toResponse({ success: true, data: { url: result.url } }, 201);
  } catch (error) {
    return apiError("API", "POST /monthly-magazines/upload", error);
  }
}