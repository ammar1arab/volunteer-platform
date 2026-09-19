import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requirePermission(req, "MANAGE_USERS");
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const details = await providers.user().getUserDetails(id);
    if (!details.success) return toResponse(details);

    const email = details.data.user.email;
    const result = await providers.otp().issueSupport(email);
    if (!result.success) return toResponse(result);

    return toResponse({
      success: true,
      data: { code: result.data.code, email },
    });
  } catch (error) {
    return apiError("API", "POST /users/[id]/support-otp", error);
  }
}
