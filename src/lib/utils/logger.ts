import * as Sentry from "@sentry/nextjs";

export type LogLevel = "info" | "warn" | "error";

export type LogMetaValue =
  | string
  | number
  | boolean
  | null
  | LogMetaValue[]
  | { [key: string]: LogMetaValue | undefined };

export type LogMeta = string | Error | { [key: string]: LogMetaValue | undefined };

export interface Logger {
  info(scope: string, action: string, meta?: LogMeta): void;
  warn(scope: string, action: string, meta?: LogMeta): void;
  error(scope: string, action: string, meta?: LogMeta): void;
}

const stringify = (value: LogMeta): string => {
  if (value instanceof Error) return value.message;
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
};

const log = (level: LogLevel, scope: string, action: string, meta?: LogMeta): void => {
  const ts = new Date().toISOString();
  const msg = `[${ts}] [${level.toUpperCase()}] [${scope}.${action}]`;
  const out = meta ? `${msg} ${stringify(meta)}` : msg;
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(out);

  if (level === "error") {
    const err =
      meta instanceof Error
        ? meta
        : new Error(`[${scope}.${action}] ${typeof meta === "string" ? meta : stringify(meta)}`);
    Sentry.withScope((sentryScope) => {
      sentryScope.setTag("scope", scope);
      sentryScope.setTag("action", action);
      Sentry.captureException(err);
    });
  }
};

export const logger: Logger = {
  info:  (scope, action, meta) => log("info",  scope, action, meta),
  warn:  (scope, action, meta) => log("warn",  scope, action, meta),
  error: (scope, action, meta) => log("error", scope, action, meta),
};
