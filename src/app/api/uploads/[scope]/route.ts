import { UserRole } from "@/core/domain/enums";
import { ok } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, badRequest, apiError, validateFile } from "@/lib/api-utils";
import type { StorageFolder } from "@/infrastructure/external";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";

const VALID_SCOPES: StorageFolder[] = ["activities", "featured-posts", "profiles", "volunteer-spotlight"];

export async function POST(req: Request, ctx: { params: Promise<{ scope: string }> }) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { scope } = await ctx.params;
    if (!VALID_SCOPES.includes(scope as StorageFolder)) {
      return badRequest("Invalid scope");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileError = validateFile(file);
    if (fileError) return badRequest(fileError);

    const buffer = Buffer.from(await file!.arrayBuffer());
    const result = await providers.storage().upload(buffer, scope as StorageFolder, file!.name);

    logger.info("API", "POST /uploads/[scope]", `scope=${scope} admin=${auth.session.user.id}`);
    return toResponse(ok({ imageUrl: result.url }), 201);
  } catch (error) {
    return apiError("API", "POST /uploads/[scope]", error);
  }
}
