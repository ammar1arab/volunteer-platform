import { fail } from "@/core/application/dtos";
import type { Result } from "@/core/application/dtos";

export function guard<T>(
  value: string | undefined | null,
  message: string,
): asserts value is string {
  if (!value?.trim()) throw new GuardError(fail("VALIDATION_ERROR", message));
}

export function guardAll(
  checks: Array<[string | undefined | null, string]>,
): void {
  for (const [value, message] of checks) {
    if (!value?.trim()) throw new GuardError(fail("VALIDATION_ERROR", message));
  }
}

export function guardLength(
  value: string,
  min: number,
  max: number,
  message: string,
): void {
  if (value.length < min || value.length > max)
    throw new GuardError(fail("VALIDATION_ERROR", message));
}

export function guardRange(
  value: number,
  min: number,
  max: number,
  message: string,
): void {
  if (value < min || value > max)
    throw new GuardError(fail("VALIDATION_ERROR", message));
}

export class GuardError {
  constructor(public readonly result: Result<never>) {}
}
