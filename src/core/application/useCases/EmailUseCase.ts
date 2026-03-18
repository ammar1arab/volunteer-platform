import { UserRepository } from "@/infrastructure/persistence/repositories";
import ResendClient from "@/infrastructure/external/resend/ResendClient";
import { serviceError, guard } from "@/core/application/common";
import { applyVariables, buildBulkEmail } from "@/lib/templates/emails/bulkEmail";
import { logger } from "@/lib/utils";
import {
  ok,
  EmailRecipientFilters,
  SendBulkEmailInput,
  GetEmailRecipientsResponse,
  SendBulkEmailApiResponse,
} from "@/core/application/dtos";

const BATCH_SIZE = 100;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

class EmailUseCase {
  private static readonly SCOPE = "EmailUseCase";

  constructor(private userRepo: UserRepository) {}

  async previewRecipients(filters: EmailRecipientFilters): Promise<GetEmailRecipientsResponse> {
    try {
      const recipients = await this.userRepo.findEmailRecipients(filters);
      logger.info(EmailUseCase.SCOPE, "previewRecipients", `count=${recipients.length}`);
      return ok({ recipients });
    } catch (error) {
      return serviceError(EmailUseCase.SCOPE, "previewRecipients", error, "حدث خطأ أثناء جلب المستلمين");
    }
  }

  async sendBulk(input: SendBulkEmailInput): Promise<SendBulkEmailApiResponse> {
    try {
      guard(input.subject, "العنوان مطلوب");
      guard(input.body,    "المحتوى مطلوب");

      const allRecipients = await this.userRepo.findEmailRecipients(input.filters);
      const recipients    = input.recipientIds?.length
        ? allRecipients.filter((r) => input.recipientIds!.includes(r.id))
        : allRecipients;

      if (!recipients.length) return ok({ sent: 0 });

      const resend = ResendClient.getInstance();

      const emails = recipients.map((r) => {
        const vars = { name: r.name, city: r.city, hours: r.hours, activityLink: input.activityLink };
        return {
          from:    input.fromAlias,
          to:      r.email,
          subject: applyVariables(input.subject, vars),
          html:    buildBulkEmail({
            subject:   applyVariables(input.subject, vars),
            body:      applyVariables(input.body, vars),
            fromAlias: input.fromAlias,
          }),
        };
      });

      let sent = 0;
      for (const batch of chunkArray(emails, BATCH_SIZE)) {
        await resend.batch.send(batch as Parameters<typeof resend.batch.send>[0]);
        sent += batch.length;
      }

      logger.info(EmailUseCase.SCOPE, "sendBulk", `sent=${sent} from=${input.fromAlias}`);
      return ok({ sent });
    } catch (error) {
      return serviceError(EmailUseCase.SCOPE, "sendBulk", error, "حدث خطأ أثناء إرسال الإيميلات");
    }
  }
}

export default EmailUseCase;