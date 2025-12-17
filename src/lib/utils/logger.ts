export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export type LogContext = Record<string, unknown>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function safeContext(context: unknown): LogContext | undefined {
  if (context == null) return undefined;

  if (isPlainObject(context)) return context;

  if (context instanceof Error) {
    return {
      error: {
        name: context.name,
        message: context.message,
        stack: context.stack,
      },
    };
  }

  return { value: context };
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

class Logger {
  private static ts() {
    return new Date().toISOString();
  }

  private static fmt(level: LogLevel, message: string, context?: unknown) {
    const c = safeContext(context);
    const base = `[${level}] ${this.ts()} - ${message}`;
    return c ? `${base}\n${safeStringify(c)}` : base;
  }

  static debug(message: string, context?: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.log(this.fmt(LogLevel.DEBUG, message, context));
    }
  }

  static info(message: string, context?: unknown) {
    console.log(this.fmt(LogLevel.INFO, message, context));
  }

  static warn(message: string, context?: unknown) {
    console.warn(this.fmt(LogLevel.WARN, message, context));
  }

  static error(message: string, error?: unknown, context?: unknown) {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack, code: (error as any)?.code }
        : { value: error };

    const merged =
      isPlainObject(context) ? { ...context, error: err } : { error: err, context: safeContext(context) };

    console.error(this.fmt(LogLevel.ERROR, message, merged));
  }
}

export default Logger;
