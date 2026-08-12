import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  issueCertificates,
  activityReminders,
  processMeetingSyncRequested,
  processPendingMeetingSyncs,
  processMeetingReportRequested,
  processDueMeetingReports
} from "@/lib/inngest";

export const maxDuration = 300;
export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    issueCertificates,
    activityReminders,
    processMeetingSyncRequested,
    processPendingMeetingSyncs,
    processMeetingReportRequested,
    processDueMeetingReports
  ],
  streaming: false
});
