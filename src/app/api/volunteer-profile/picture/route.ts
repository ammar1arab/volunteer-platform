import { logger } from "@/core/application/helpers";
import type { UploadProfilePictureRequest } from "@/core/application/dtos";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, badRequest, apiError, validateFile } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileError = validateFile(file, 5);
    if (fileError) return badRequest(fileError);

    const dto: UploadProfilePictureRequest = {
      userId: auth.session.user.id,
      file: file!,
    };

    logger.info("API", "POST /volunteer-profile/picture", `user=${auth.session.user.id}`);
    return toResponse(await providers.volunteerProfile().uploadProfilePicture(dto), 201);
  } catch (error) {
    return apiError("API", "POST /volunteer-profile/picture", error);
  }
}
