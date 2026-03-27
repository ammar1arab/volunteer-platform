import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0a78c8a4f83d0ed75b781cd2c36d1918@o4511117165395968.ingest.de.sentry.io/4511117186695248",
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  enableLogs: true,
  sendDefaultPii: true,
  debug: false,
  ignoreErrors: ["NEXT_NOT_FOUND", "NEXT_REDIRECT"],
});
