export type LogLevel = "info" | "warn" | "error";

export interface Logger {
  info(scope: string, action: string, meta?: unknown): void;
  warn(scope: string, action: string, meta?: unknown): void;
  error(scope: string, action: string, meta?: unknown): void;
}

const stringify = (value: unknown): string => {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
};

const log = (level: LogLevel, scope: string, action: string, meta?: unknown): void => {
  const ts = new Date().toISOString();
  const msg = `[${ts}] [${level.toUpperCase()}] [${scope}.${action}]`;
  const out = meta ? `${msg} ${stringify(meta)}` : msg;
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(out);
};

export const logger: Logger = {
  info: (scope, action, meta) => log("info", scope, action, meta),
  warn: (scope, action, meta) => log("warn", scope, action, meta),
  error: (scope, action, meta) => log("error", scope, action, meta)
};
