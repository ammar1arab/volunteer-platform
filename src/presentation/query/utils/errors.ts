import type { ErrorDetails } from "@/core/application/dtos";

export type { ErrorDetails };

export class ApiError extends Error {
  readonly code: string;
  readonly details?: ErrorDetails;

  constructor(message: string, code = "UNKNOWN", details?: ErrorDetails) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export function getErrorMessage(err: unknown, fallback = "حدث خطأ غير متوقع"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

export function isNotFoundError(err: Error | null | undefined): boolean {
  if (!err) return false;
  if (err instanceof ApiError) return err.code === "NOT_FOUND" || err.message.includes("404");
  return /not found|غير موجود|404/i.test(err.message);
}
