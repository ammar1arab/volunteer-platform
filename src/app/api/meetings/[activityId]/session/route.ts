import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionActionBody = {
  action: string;
  userId?: string;
  allow?: boolean;
};

export async function GET(req: Request, ctx: { params: Promise<{ activityId: string }> }) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const { activityId } = await ctx.params;
    logger.info(
      "API",
      "GET /meetings/[activityId]/session",
      `activityId=${activityId} userId=${auth.session.user.id}`
    );
    const result = await providers
      .meeting()
      .touchMeetingSession(
        activityId,
        auth.session.user.id,
        auth.session.user.role,
        auth.session.user.email
      );
    const response = toResponse(result);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return apiError("API", "GET /meetings/[activityId]/session", error);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ activityId: string }> }) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const { activityId } = await ctx.params;
    const body = await parseJson<SessionActionBody>(req);
    if (!body || typeof body.action !== "string") return badRequest("طلب غير صالح");

    if (body.action === "leave") {
      logger.info(
        "API",
        "POST /meetings/[activityId]/session leave",
        `activityId=${activityId} userId=${auth.session.user.id}`
      );
      return toResponse(
        await providers
          .meeting()
          .leaveMeetingSession(activityId, auth.session.user.id, auth.session.user.role)
      );
    }

    if (body.action === "admit") {
      if (typeof body.userId !== "string" || typeof body.allow !== "boolean") {
        return badRequest("طلب القبول غير صالح");
      }
      logger.info(
        "API",
        "POST /meetings/[activityId]/session admit",
        `activityId=${activityId} hostId=${auth.session.user.id} guestId=${body.userId} allow=${body.allow}`
      );
      return toResponse(
        await providers
          .meeting()
          .admitMeetingGuest(
            activityId,
            auth.session.user.id,
            auth.session.user.role,
            body.userId,
            body.allow,
            auth.session.user.email
          )
      );
    }

    return badRequest("إجراء غير مدعوم");
  } catch (error) {
    return apiError("API", "POST /meetings/[activityId]/session", error);
  }
}
