import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { apiError, badRequest, unauthorized } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";
import { UserRole } from "@/core/domain/enums";
import { prisma } from "@/infrastructure/persistence/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorized();

    const params = req.nextUrl.searchParams;

    if (params.get("broadcasts") === "1") {
      if (session.user.role !== UserRole.ADMIN) return unauthorized();
      logger.info("notifications", "GET broadcasts", `adminId=${session.user.id}`);
      const result = await providers.notification().getRecentBroadcasts();
      return Response.json(result);
    }

    if (params.get("activityFilter") === "1") {
      if (session.user.role !== UserRole.ADMIN) return unauthorized();
      const rows = await prisma.activityParticipation.groupBy({
        by: ["activityId", "status"],
        where: { status: { in: ["PENDING", "APPROVED"] } },
        _count: true
      });
      const pending = new Set(rows.filter((r) => r.status === "PENDING").map((r) => r.activityId));
      const approved = new Set(rows.filter((r) => r.status === "APPROVED").map((r) => r.activityId));
      return Response.json({ success: true, data: { pending: [...pending], approved: [...approved] } });
    }

    if (params.get("preview") === "1") {
      if (session.user.role !== UserRole.ADMIN) return unauthorized();
      const target = params.get("target") ?? "ALL";
      const targetValue = params.get("targetValue") ?? undefined;
      if (!["ALL", "CITY", "GENDER", "HOURS", "USERS", "ACTIVITY_PENDING", "ACTIVITY_APPROVED"].includes(target))
        return badRequest("نوع الاستهداف غير صحيح");
      if ((target === "CITY" || target === "GENDER") && !targetValue) return badRequest("القيمة مطلوبة");
      if (target === "HOURS" && (!targetValue || isNaN(parseFloat(targetValue))))
        return badRequest("قيمة الساعات غير صحيحة");
      if ((target === "ACTIVITY_PENDING" || target === "ACTIVITY_APPROVED") && !targetValue)
        return badRequest("يجب اختيار نشاط");
      logger.info("notifications", "GET preview", `adminId=${session.user.id} target=${target}`);
      const result = await providers.notification().previewTargets(target, targetValue);
      return Response.json(result);
    }

    logger.info("notifications", "GET", `userId=${session.user.id}`);
    const result = await providers.notification().getRecent(session.user.id);
    return Response.json(result);
  } catch (error) {
    return apiError("notifications", "GET", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return unauthorized();

    const body = await req.json().catch(() => null);
    const { title, message, target, targetValue, link, userIds } = body ?? {};

    if (!title?.trim() || !message?.trim() || !target) return badRequest("البيانات ناقصة");
    if (!["ALL", "CITY", "GENDER", "HOURS", "USERS", "ACTIVITY_PENDING", "ACTIVITY_APPROVED"].includes(target))
      return badRequest("نوع الاستهداف غير صحيح");
    if ((target === "CITY" || target === "GENDER") && !targetValue && !userIds?.length)
      return badRequest("القيمة مطلوبة");
    if (target === "HOURS" && (!targetValue || isNaN(parseFloat(targetValue))))
      return badRequest("قيمة الساعات غير صحيحة");
    if ((target === "ACTIVITY_PENDING" || target === "ACTIVITY_APPROVED") && !targetValue)
      return badRequest("يجب اختيار نشاط");
    if (target === "USERS" && (!Array.isArray(userIds) || !userIds.length))
      return badRequest("يجب تحديد مستخدم واحد على الأقل");

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
    const result = await providers.notification().sendCustom({
      targetUserIds,
      title: title.trim(),
      message: message.trim(),
      link: link?.trim() || undefined,
      target,
      targetValue: targetValue ?? undefined
    });
    return Response.json(result);
  } catch (error) {
    return apiError("notifications", "POST", error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorized();

    const params = req.nextUrl.searchParams;

    if (params.get("clearBroadcasts") === "1") {
      if (session.user.role !== UserRole.ADMIN) return unauthorized();
      logger.info("notifications", "DELETE clearBroadcasts", `adminId=${session.user.id}`);
      const result = await providers.notification().clearBroadcasts();
      return Response.json(result);
    }

    logger.info("notifications", "DELETE clearHistory", `userId=${session.user.id}`);
    const result = await providers.notification().clearHistory(session.user.id);
    return Response.json(result);
  } catch (error) {
    return apiError("notifications", "DELETE", error);
  }
}
