import * as Sentry from "@sentry/nextjs";
import { AttendanceStatus } from "@/core/domain/enums";
import { inngest } from "@/lib/inngest/client";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";

const SCOPE = "issueCertificates";

export const issueCertificates = inngest.createFunction(
  {
    id: "issue-certificates",
    name: "Issue Certificates",
    retries: 3,
    triggers: [{ event: "activity/completed" }]
  },
  async ({ event, step }) => {
    const { activityId } = event.data as { activityId: string };
    logger.info(SCOPE, "start", `activityId=${activityId}`);

    const attendedIds = await step.run("fetch-attended", async () => {
      const result = await providers.activity().getVolunteers(activityId);
      if (!result.success) throw new Error(result.error.message);

      const ids = result.data.volunteers
        .filter((volunteer) => volunteer.attendanceStatus === AttendanceStatus.ATTENDED && !volunteer.hasCertificate)
        .map((volunteer) => volunteer.id);

      logger.info(SCOPE, "fetch-attended", `Found ${ids.length} attended for activityId=${activityId}`);
      return ids;
    });

    if (!attendedIds.length) {
      logger.info(SCOPE, "no-volunteers", `Skipping activityId=${activityId}`);
      return { issued: 0 };
    }

    let issued = 0;

    for (const userId of attendedIds) {
      const result = await step.run(`issue-${userId}`, () =>
        providers.certificate().issueForVolunteer(activityId, userId)
      );

      if (result.success) {
        issued += 1;
        continue;
      }

      if (result.error.code === "CONFLICT") continue;

      Sentry.withScope((scope) => {
        scope.setTag("inngest.function", "issue-certificates");
        scope.setTag("activityId", activityId);
        scope.setTag("volunteerId", userId);
        Sentry.captureMessage(`Certificate issue failed: ${result.error.message}`);
      });
      logger.warn(SCOPE, `issue-${userId}`, `Failed: ${result.error.code} ${result.error.message}`);
    }

    logger.info(
      SCOPE,
      "complete",
      `Issued ${issued}/${attendedIds.length} certificates for activityId=${activityId}`
    );
    return { issued };
  }
);
