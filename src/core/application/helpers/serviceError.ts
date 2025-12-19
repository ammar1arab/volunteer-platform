import { logger } from "./logger";

type ServiceResponseShape = { success: boolean; error?: string };

export const serviceError = <T extends ServiceResponseShape>(
  scope: string,
  action: string,
  error: unknown,
  message: string
): T => {
  logger.error(scope, action, normalizeError(error));
  return { success: false, error: message } as T;
};

const normalizeError = (err: unknown) => {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { message: String(err) };
};
