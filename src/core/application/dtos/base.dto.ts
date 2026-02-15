export type ErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export type Result<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: ErrorPayload };

export const ok = <T>(data: T, message?: string): Result<T> => ({
  success: true,
  data,
  message,
});
export const fail = (
  code: string,
  message: string,
  details?: unknown,
): Result<never> => ({
  success: false,
  error: { code, message, details },
});