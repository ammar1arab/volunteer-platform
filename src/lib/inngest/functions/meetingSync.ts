import { inngest } from "@/lib/inngest/client";
import { providers } from "@/lib/providers";
import { prisma } from "@/infrastructure/persistence/prisma";
import { MeetingLinkSource, MeetingReportStatus, MeetingSyncStatus } from "@/core/domain/enums";
import { logger } from "@/lib/utils";

const SCOPE = "meetingSync";

function buildComparableEnd(date: Date, endTime: string): Date {
  const [h, m] = endTime.split(":").map(Number);
  const end = new Date(date);
  end.setHours(h || 0, m || 0, 0, 0);
  return end;
}

export const processMeetingSyncRequested = inngest.createFunction(
  {
    id: "meeting-sync-requested",
    name: "Process Meeting Sync Request",
    retries: 3,
    triggers: [{ event: "meeting/sync.requested" }]
  },
  async ({ event, step }) => {
    const { operationId } = event.data as { operationId: string };
    logger.info(SCOPE, "sync.requested", `operationId=${operationId}`);

    const result = await step.run("process-operation", async () => {
      return providers.meeting().processSyncOperation(operationId);
    });

    if (result.success) {
      const schedule = await step.run("resolve-report-schedule", async () => {
        const op = await prisma.meetingSyncOperation.findUnique({
          where: { id: operationId },
          select: {
            type: true,
            activity: {
              select: {
                id: true,
                date: true,
                endTime: true,
                meetingCode: true,
                meetingLinkSource: true,
                meetingSyncStatus: true
              }
            }
          }
        });

        if (!op?.activity) return null;
        if (op.type !== "CREATE" && op.type !== "UPDATE") return null;
        if (op.activity.meetingLinkSource !== MeetingLinkSource.GOOGLE_MEET_AUTO) return null;
        if (!op.activity.meetingCode) return null;
        if (op.activity.meetingSyncStatus !== MeetingSyncStatus.SYNCED) return null;

        const end = buildComparableEnd(op.activity.date, op.activity.endTime);
        // Import ~15 minutes after scheduled end so conference records can settle.
        const importAt = new Date(end.getTime() + 15 * 60 * 1000);
        return { activityId: op.activity.id, importAt: importAt.toISOString() };
      });

      if (schedule) {
        const importAtMs = new Date(schedule.importAt).getTime();
        await step.sendEvent("request-report-import", {
          name: "meeting/report.requested",
          data: { activityId: schedule.activityId },
          ...(importAtMs > Date.now() ? { ts: importAtMs } : {})
        });
      }
    }

    return result;
  }
);

export const processPendingMeetingSyncs = inngest.createFunction(
  {
    id: "meeting-sync-cron",
    name: "Process Pending Meeting Syncs",
    retries: 1,
    triggers: [{ cron: "*/5 * * * *" }]
  },
  async ({ step }) => {
    const pending = await step.run("load-pending", async () => {
      const { MeetingSyncOperationRepository } = await import(
        "@/infrastructure/persistence/repositories"
      );
      const repo = new MeetingSyncOperationRepository();
      return repo.findPending(25);
    });

    logger.info(SCOPE, "cron", `pending=${pending.length}`);

    const results = [];
    for (const op of pending) {
      const result = await step.run(`process-${op.id}`, async () => {
        return providers.meeting().processSyncOperation(op.id);
      });
      results.push({ operationId: op.id, ...result });
    }

    return { processed: results.length, results };
  }
);

export const processMeetingReportRequested = inngest.createFunction(
  {
    id: "meeting-report-requested",
    name: "Process Meeting Report Request",
    retries: 2,
    triggers: [{ event: "meeting/report.requested" }]
  },
  async ({ event, step }) => {
    const { activityId } = event.data as { activityId: string };
    logger.info(SCOPE, "report.requested", `activityId=${activityId}`);

    const result = await step.run("import-report", async () => {
      return providers.meeting().importReport(activityId);
    });

    return {
      success: result.success,
      activityId,
      message: result.success ? undefined : result.error.message
    };
  }
);

/** Reconcile finished auto-Meet activities that still need a report import. */
export const processDueMeetingReports = inngest.createFunction(
  {
    id: "meeting-report-cron",
    name: "Process Due Meeting Reports",
    retries: 1,
    triggers: [{ cron: "*/15 * * * *" }]
  },
  async ({ step }) => {
    const due = await step.run("load-due-reports", async () => {
      const now = new Date();
      const rows = await prisma.activity.findMany({
        where: {
          deletedAt: null,
          meetingLinkSource: MeetingLinkSource.GOOGLE_MEET_AUTO,
          meetingCode: { not: null },
          meetingSyncStatus: MeetingSyncStatus.SYNCED,
          OR: [
            { meetingReport: null },
            {
              meetingReport: {
                status: {
                  in: [
                    MeetingReportStatus.PENDING,
                    MeetingReportStatus.FAILED,
                    MeetingReportStatus.UNAVAILABLE
                  ]
                }
              }
            }
          ]
        },
        select: {
          id: true,
          date: true,
          endTime: true
        },
        take: 25
      });

      return rows
        .filter((row) => {
          const end = buildComparableEnd(row.date, row.endTime);
          return end.getTime() + 15 * 60 * 1000 <= now.getTime();
        })
        .map((row) => row.id);
    });

    logger.info(SCOPE, "report.cron", `due=${due.length}`);

    if (!due.length) return { queued: 0 };

    await step.sendEvent(
      "queue-due-reports",
      due.map((activityId) => ({
        name: "meeting/report.requested" as const,
        data: { activityId }
      }))
    );

    return { queued: due.length };
  }
);
