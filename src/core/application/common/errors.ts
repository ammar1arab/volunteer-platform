import { fail } from "@/core/application/dtos";
import { logger } from "@/lib/utils/logger";
import { GuardError } from "./validation";

export const serviceError = (
  scope: string,
  action: string,
  error: unknown,
  userMessage: string,
) => {
  if (error instanceof GuardError) return error.result;
  
  if (error && typeof error === "object" && "result" in error) {
    return (error as { result: ReturnType<typeof fail> }).result;
  }

  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack ?? null }
      : { message: String(error) };

  logger.error(scope, action, normalized);
  return fail("INTERNAL_ERROR", userMessage, normalized);
};