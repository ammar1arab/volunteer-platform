import { NextRequest } from "next/server";
import { apiError, badRequest, requireAuth, toResponse } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";
import { UserRole, audienceTargetError } from "@/core/domain/enums";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const needsAdmin =
      params.get("broadcasts") === "1" ||
      params.get("activityFilter") === "1" ||
      params.get("preview") === "1";
    const auth = await requireAuth(req, needsAdmin ? UserRole.ADMIN : undefined);
    if ("error" in auth) return auth.error;
    const { session } = auth;

    if (params.get("broadcasts") === "1") {
      logger.info("notifications", "GET broadcasts", `adminId=${session.user.id}`);
      return Response.json(await providers.notification().getRecentBroadcasts());
    }

    if (params.get("activityFilter") === "1") {
      return toResponse(await providers.participation().getAudienceActivityIds());
    }

    if (params.get("preview") === "1") {
      const target = params.get("target") ?? "ALL";
      const targetValue = params.get("targetValue") ?? undefined;
      const previewError = audienceTargetError(target, targetValue);
      if (previewError) return badRequest(previewError);
      logger.info("notifications", "GET preview", `adminId=${session.user.id} target=${target}`);
      return Response.json(await providers.notification().previewTargets(target, targetValue));
    }

    logger.info("notifications", "GET", `userId=${session.user.id}`);
    return Response.json(await providers.notification().getRecent(session.user.id));
  } catch (error) {
    return apiError("notifications", "GET", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;
    const { session } = auth;

    const body = await req.json().catch(() => null);
    const { title, message, target, targetValue, link, userIds } = body ?? {};

    if (!title?.trim() || !message?.trim() || !target) return badRequest("البيانات ناقصة");
    const sendError = audienceTargetError(
      target,
      targetValue,
      Array.isArray(userIds) ? userIds : undefined
    );
    if (sendError) return badRequest(sendError);

    let targetUserIds: string[] = [];

    if (Array.isArray(userIds) && userIds.length > 0) {
      targetUserIds = userIds;
    } else {
      const preview = await providers.notification().previewTargets(target, targetValue);
      const users = (preview as { data?: { users?: { id: string }[] } })?.data?.users ?? [];
      targetUserIds = users.map((u) => u.id);
    }

    if (!targetUserIds.length) return Response.json({ success: true, data: { sent: 0 } });

    logger.info(
      "notifications",
      "POST sendCustom",
      `adminId=${session.user.id} target=${target} count=${targetUserIds.length}`
    );
    return Response.json(
      await providers.notification().sendCustom({
        targetUserIds,
        title: title.trim(),
        message: message.trim(),
        link: link?.trim() || undefined,
        target,
        targetValue: targetValue ?? undefined
      })
    );
  } catch (error) {
    return apiError("notifications", "POST", error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const auth = await requireAuth(req, params.get("clearBroadcasts") === "1" ? UserRole.ADMIN : undefined);
    if ("error" in auth) return auth.error;
    const { session } = auth;

    if (params.get("clearBroadcasts") === "1") {
      logger.info("notifications", "DELETE clearBroadcasts", `adminId=${session.user.id}`);
      return Response.json(await providers.notification().clearBroadcasts());
    }

    logger.info("notifications", "DELETE clearHistory", `userId=${session.user.id}`);
    return Response.json(await providers.notification().clearHistory(session.user.id));
  } catch (error) {
    return apiError("notifications", "DELETE", error);
  }
}
