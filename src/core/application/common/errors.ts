import { fail } from "@/core/application/dtos";
import { logger } from "@/lib/utils/logger";
import { GuardError } from "./validation";

export const serviceError = (
  scope: string,
  action: string,
  error: Error | string,
  userMessage: string,
) => {
  if (error instanceof GuardError) return error.result;

  if (error instanceof Error && "result" in error) {
    return (error as Error & { result: ReturnType<typeof fail> }).result;
  }

  const normalized =
    typeof error === "string"
      ? { message: error }
      : { name: error.name, message: error.message, stack: error.stack ?? null };

  logger.error(scope, action, normalized);
  return fail("INTERNAL_ERROR", userMessage, normalized);
};
