import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { issueCertificates } from "@/lib/inngest/functions/issueCertificates";

export const maxDuration = 60;
export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [issueCertificates]
});
