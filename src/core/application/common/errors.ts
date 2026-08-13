import { fail } from "@/core/application/dtos";
import { logger } from "@/lib/utils/logger";
import { GuardError } from "./validation";

export const serviceError = <T>(
  scope: string,
  action: string,
  error: T,
  userMessage: string,
) => {
  if (error instanceof GuardError) return error.result;

  if (error instanceof Error && "result" in error) {
    return (error as Error & { result: ReturnType<typeof fail> }).result;
  }

  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack ?? null }
      : { message: typeof error === "string" ? error : String(error) };

  logger.error(scope, action, normalized);
  return fail("INTERNAL_ERROR", userMessage, normalized);
};
