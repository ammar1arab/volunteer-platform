import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

const captured = new WeakSet<object>();

export function captureOnce(error: Error): void {
  if (captured.has(error)) return;
  captured.add(error);
  Sentry.captureException(error);
}

export function useCaptureOnce(error: Error): void {
  useEffect(() => {
    captureOnce(error);
  }, [error]);
}
