import { NextResponse } from "next/server";
import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { apiError } from "@/lib/api-utils";
import { ROUTES } from "@/presentation/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const redirectBase = ROUTES.ADMIN.GOOGLE_MEET;

    if (error) {
      logger.warn("API", "GET /integrations/google/callback", `oauth_error=${error}`);
      return NextResponse.redirect(new URL(`${redirectBase}?error=${encodeURIComponent(error)}`, url.origin));
    }

    if (!code) {
      return NextResponse.redirect(new URL(`${redirectBase}?error=missing_code`, url.origin));
    }

    let connectedById = "";
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as { userId?: string };
        connectedById = parsed.userId ?? "";
      } catch {
        logger.warn("API", "GET /integrations/google/callback", "invalid state");
      }
    }

    if (!connectedById) {
      return NextResponse.redirect(new URL(`${redirectBase}?error=invalid_state`, url.origin));
    }

    logger.info("API", "GET /integrations/google/callback", `userId=${connectedById}`);
    const result = await providers.meeting().handleOAuthCallback(code, connectedById);

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`${redirectBase}?error=${encodeURIComponent(result.error.message)}`, url.origin)
      );
    }

    return NextResponse.redirect(new URL(`${redirectBase}?connected=1`, url.origin));
  } catch (error) {
    return apiError("API", "GET /integrations/google/callback", error);
  }
}
