import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./utils/errors";

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN")) {
    return false;
  }
  if (/401|403|unauthorized|forbidden/i.test(error.message)) {
    return false;
  }
  return failureCount < 2;
}


export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 15 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        structuralSharing: true
      },
      mutations: {
        retry: false
      }
    }
  });
}
