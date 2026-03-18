import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { apiError, badRequest, unauthorized } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";
import { UserRole } from "@/core/domain/enums";
import type { EmailAlias, EmailTarget } from "@/core/application/dtos";

const VALID_ALIASES = new Set([
  "contact@youthprints.online",
  "support@youthprints.online",
  "noreply@youthprints.online",
  "certificates@youthprints.online",
]);

const VALID_TARGETS = new Set(["ALL", "CITY", "GENDER"]);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return unauthorized();

    const params      = req.nextUrl.searchParams;
    const target      = params.get("target") ?? "ALL";
    const targetValue = params.get("targetValue") ?? undefined;
    const minHours    = params.get("minHours")    ? Number(params.get("minHours"))    : undefined;
    const skillFilter = params.get("skillFilter") ?? undefined;

    if (!VALID_TARGETS.has(target)) return badRequest("نوع الاستهداف غير صحيح");
    if ((target === "CITY" || target === "GENDER") && !targetValue) return badRequest("القيمة مطلوبة");

    logger.info("emails", "GET preview", `adminId=${session.user.id} target=${target}`);
    const result = await providers.email().previewRecipients({ target: target as EmailTarget, targetValue, minHours, skillFilter });
    return Response.json(result);
  } catch (error) {
    return apiError("emails", "GET", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return unauthorized();

    const body = await req.json().catch(() => null);
    const { fromAlias, subject, body: emailBody, filters, recipientIds } = body ?? {};

    if (!fromAlias || !VALID_ALIASES.has(fromAlias)) return badRequest("الـ alias غير صحيح");
    if (!subject?.trim())   return badRequest("العنوان مطلوب");
    if (!emailBody?.trim()) return badRequest("المحتوى مطلوب");
    if (!filters?.target || !VALID_TARGETS.has(filters.target)) return badRequest("الاستهداف مطلوب");

    logger.info("emails", "POST sendBulk", `adminId=${session.user.id} from=${fromAlias}`);
    const result = await providers.email().sendBulk({ fromAlias: fromAlias as EmailAlias, subject, body: emailBody, filters, recipientIds });
    return Response.json(result);
  } catch (error) {
    return apiError("emails", "POST", error);
  }
}