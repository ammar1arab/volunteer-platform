export type LogLevel = "info" | "warn" | "error";

export interface Logger {
  info(scope: string, message: string, meta?: unknown): void;
  warn(scope: string, message: string, meta?: unknown): void;
  error(scope: string, message: string, meta?: unknown): void;
}

const format = (level: LogLevel, scope: string, message: string, meta?: unknown) => {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] [${scope}] ${message}`;
  if (!meta) return base;
  return `${base} | ${safeStringify(meta)}`;
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return "[Unserializable meta]";
  }
};

export const logger: Logger = {
  info(scope, message, meta) {
    console.log(format("info", scope, message, meta));
  },
  warn(scope, message, meta) {
    console.warn(format("warn", scope, message, meta));
  },
  error(scope, message, meta) {
    console.error(format("error", scope, message, meta));
  },
};
