import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError } from "@/lib/api-utils";

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
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    const origin = resolveRequestOrigin(req);
    const redirectUri = `${origin}/api/integrations/google/callback`;
    logger.info("API", "GET /integrations/google/connect", {
      userId: auth.session.user.id,
      origin,
      redirectUri,
      clientIdSuffix: (process.env.GOOGLE_CLIENT_ID ?? "").slice(-12) || "missing"
    });
    return toResponse(await providers.meeting().getConnectUrl(auth.session.user.id, redirectUri));
  } catch (error) {
    return apiError("API", "GET /integrations/google/connect", error);
  }
}

export async function POST(req: Request) {
  return GET(req);
}
