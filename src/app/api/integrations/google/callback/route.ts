import { NextResponse } from "next/server";
import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { apiError } from "@/lib/api-utils";
import { ROUTES } from "@/presentation/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveRequestOrigin(req: Request): string {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, "");
  return url.origin.replace(/\/$/, "");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const origin = resolveRequestOrigin(req);
    const fallbackRedirectUri = `${origin}/api/integrations/google/callback`;

    const redirectBase = ROUTES.ADMIN.GOOGLE_MEET;

    if (error) {
      logger.warn("API", "GET /integrations/google/callback", `oauth_error=${error}`);
      return NextResponse.redirect(new URL(`${redirectBase}?error=${encodeURIComponent(error)}`, origin));
    }

    if (!code) {
      return NextResponse.redirect(new URL(`${redirectBase}?error=missing_code`, origin));
    }

    let connectedById = "";
    let redirectUri = fallbackRedirectUri;
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
          userId?: string;
          redirectUri?: string;
        };
        connectedById = parsed.userId ?? "";
        if (parsed.redirectUri?.trim()) redirectUri = parsed.redirectUri.trim();
      } catch {
        logger.warn("API", "GET /integrations/google/callback", "invalid state");
      }
    }

    if (!connectedById) {
      return NextResponse.redirect(new URL(`${redirectBase}?error=invalid_state`, origin));
    }

    logger.info("API", "GET /integrations/google/callback", {
      userId: connectedById,
      redirectUri,
      origin,
      hasCode: Boolean(code),
      hasState: Boolean(state)
    });
    const result = await providers.meeting().handleOAuthCallback(code, connectedById, redirectUri);

    if (!result.success) {
      const details = result.error.details;
      const reason =
        details && typeof details === "object" && !Array.isArray(details) && typeof details.message === "string"
          ? details.message
          : result.error.message;
      logger.error("API", "GET /integrations/google/callback", {
        code: result.error.code,
        message: result.error.message,
        reason
      });
      const failUrl = new URL(redirectBase, origin);
      failUrl.searchParams.set("error", result.error.message);
      failUrl.searchParams.set("reason", reason.slice(0, 300));
      return NextResponse.redirect(failUrl);
    }

    return NextResponse.redirect(new URL(`${redirectBase}?connected=1`, origin));
  } catch (error) {
    return apiError("API", "GET /integrations/google/callback", error);
  }
}
