import { NextRequest } from "next/server";
import { apiError, badRequest } from "@/lib/api-utils";
import ResendClient from "@/infrastructure/external/resend/ResendClient";
import { buildContactEmail } from "@/lib/templates/emails/contactEmail";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { name, email, message } = body ?? {};

    logger.info("contact", "POST", { name, email });

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      logger.warn("contact", "POST", "Missing fields");
      return badRequest("جميع الحقول مطلوبة");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logger.warn("contact", "POST", `Invalid email: ${email}`);
      return badRequest("البريد الإلكتروني غير صحيح");
    }

    if (message.trim().length > 2000) {
      logger.warn("contact", "POST", "Message too long");
      return badRequest("الرسالة طويلة جداً");
    }

    const result = await ResendClient.getInstance().emails.send({
      from: "بصمات شبابية <contact@youthprints.online>",
      to: "contact@youthprints.online",
      replyTo: email,
      subject: `رسالة جديدة من ${name}`,
      html: buildContactEmail(name.trim(), email.trim(), message.trim())
    });

    if (result.error) {
      logger.error("contact", "POST", result.error.message);
      return apiError("contact", "POST", result.error.message);
    }

    logger.info("contact", "POST", { sent: true, id: result.data?.id });

    return Response.json({ success: true });
  } catch (error) {
    return apiError("contact", "POST", error);
  }
}
