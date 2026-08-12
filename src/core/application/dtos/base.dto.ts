export type ErrorDetails =
  | string
  | number
  | boolean
  | null
  | { [key: string]: ErrorDetails | undefined }
  | ErrorDetails[];

export type ErrorPayload = {
  code: string;
  message: string;
  details?: ErrorDetails;
};

export type Result<T> = { success: true; data: T; message?: string } | { success: false; error: ErrorPayload };

export const ok = <T>(data: T, message?: string): Result<T> => ({
  success: true,
  data,
  message
});

export const fail = (code: string, message: string, details?: ErrorDetails): Result<never> => ({
  success: false,
  error: { code, message, details }
});
