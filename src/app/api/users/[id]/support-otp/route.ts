import { providers } from "@/lib/providers";
import { toResponse, requirePermission, parseJson, apiError, badRequest } from "@/lib/api-utils";
import { OtpType } from "@/core/domain/enums";
import type { SendOtpRequest } from "@/core/application/dtos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requirePermission(req, "MANAGE_USERS");
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const body = await parseJson<{ type?: string }>(req);
    const typeRaw = body?.type ?? OtpType.FORGOT_PASSWORD;

    if (typeRaw !== OtpType.EMAIL_VERIFY && typeRaw !== OtpType.FORGOT_PASSWORD) {
      return badRequest("نوع رمز التحقق غير صحيح");
    }

    const details = await providers.user().getUserDetails(id);
    if (!details.success) return toResponse(details);

    const email = details.data.user.email;
    const result = await providers.otp().issueSupport({
      email,
      type: typeRaw as SendOtpRequest["type"],
    });

    if (!result.success) return toResponse(result);

    return toResponse({
      success: true,
      data: {
        code: result.data.code,
        email,
        type: typeRaw,
      },
    });
  } catch (error) {
    return apiError("API", "POST /users/[id]/support-otp", error);
  }
}
