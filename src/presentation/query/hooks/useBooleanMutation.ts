"use client";

import { useCallback, useRef, useState } from "react";
import { type QueryKey } from "@tanstack/react-query";
import { useApiMutation } from "./useApiMutation";
import { getErrorMessage } from "../utils/errors";





export function useBooleanMutation<TVariables, TData = void>(params: {
  request: (variables: TVariables) => Promise<TData>;
  invalidateQueries?: QueryKey | QueryKey[];
  fallbackError?: string;
}) {
  const [error, setError] = useState("");
  const requestRef = useRef(params.request);
  requestRef.current = params.request;
  const fallbackRef = useRef(params.fallbackError);
  fallbackRef.current = params.fallbackError;

  const stableRequest = useCallback(
    (variables: TVariables) => requestRef.current(variables),
    []
  );

  const mutation = useApiMutation<TData, TVariables>({
    request: stableRequest,
    invalidateQueries: params.invalidateQueries
  });

  const { mutateAsync, reset: resetMutation, isPending } = mutation;

  const run = useCallback(
    async (variables: TVariables): Promise<boolean> => {
      setError("");
      try {
        await mutateAsync(variables);
        return true;
      } catch (err) {
        setError(getErrorMessage(err instanceof Error ? err : String(err), fallbackRef.current));
        return false;
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setError("");
    resetMutation();
  }, [resetMutation]);

  return {
    run,
    submitting: isPending,
    error,
    setError,
    reset
  };
}
