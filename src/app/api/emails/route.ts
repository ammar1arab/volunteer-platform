import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { apiError, badRequest, unauthorized } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";
import { UserRole } from "@/core/domain/enums";
import type { EmailAlias, EmailTarget, EmailRecipientFilters } from "@/core/application/dtos";
import { audienceTargetError } from "@/core/domain/enums";

const VALID_ALIASES = new Set([
  "contact@youthprints.online",
  "support@youthprints.online",
  "noreply@youthprints.online",
  "certificates@youthprints.online"
]);

function parseFilters(params: URLSearchParams): EmailRecipientFilters {
  return {
    target: (params.get("target") ?? "ALL") as EmailTarget,
    targetValue: params.get("targetValue") ?? undefined
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return unauthorized();

    const params = req.nextUrl.searchParams;
    if (params.get("preview") !== "1") return badRequest("الاستعلام غير صحيح");

    const filters = parseFilters(params);
    const previewError = audienceTargetError(filters.target, filters.targetValue);
    if (previewError) return badRequest(previewError);
    logger.info("emails", "GET preview", `adminId=${session.user.id} target=${filters.target}`);
    const result = await providers.email().previewRecipients(filters);
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
    const { fromAlias, subject, body: emailBody, filters, recipientIds, activityLink } = body ?? {};

    if (!fromAlias || !VALID_ALIASES.has(fromAlias)) return badRequest("الـ alias غير صحيح");
    if (!subject?.trim()) return badRequest("العنوان مطلوب");
    if (!emailBody?.trim()) return badRequest("المحتوى مطلوب");
    const sendError = audienceTargetError(
      filters?.target,
      filters?.targetValue,
      Array.isArray(recipientIds) ? recipientIds : undefined
    );
    if (sendError) return badRequest(sendError);

    logger.info("emails", "POST sendBulk", `adminId=${session.user.id} from=${fromAlias}`);
    const result = await providers.email().sendBulk({
      fromAlias: fromAlias as EmailAlias,
      subject,
      body: emailBody,
      filters,
      recipientIds,
      activityLink: activityLink ?? undefined
    });
    return Response.json(result);
  } catch (error) {
    return apiError("emails", "POST", error);
  }
}
