import type { Result } from "@/core/application/dtos";
import { ApiError } from "./errors";

export function isResult<T>(value: Result<T> | T): value is Result<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as Result<T>).success === "boolean"
  );
}

export function unwrapResult<T>(result: Result<T>): T {
  if (!result.success) {
    throw new ApiError(result.error.message, result.error.code, result.error.details);
  }
  return result.data;
}

export async function unwrapRequest<T>(request: () => Promise<Result<T>>): Promise<T> {
  return unwrapResult(await request());
}
