"use client";

import {
  type QueryKey,
  useMutation,
  useQueryClient,
  type UseMutationResult
} from "@tanstack/react-query";
import { useRef } from "react";

export interface UseApiMutationParams<TData, TVariables> {
  request: (variables: TVariables) => Promise<TData>;
  invalidateQueries?: QueryKey | QueryKey[];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

function toQueryKeyList(keys?: QueryKey | QueryKey[]): QueryKey[] {
  if (!keys) return [];
  if (keys.length > 0 && Array.isArray(keys[0])) {
    return keys as QueryKey[];
  }
  return [keys as QueryKey];
}

export function useApiMutation<TData, TVariables = void>({
  request,
  invalidateQueries,
  onSuccess,
  onError
}: UseApiMutationParams<TData, TVariables>): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();

  const requestRef = useRef(request);
  requestRef.current = request;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const invalidateRef = useRef(invalidateQueries);
  invalidateRef.current = invalidateQueries;

  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => requestRef.current(variables),
    onSuccess: async (data, variables) => {
      const keys = toQueryKeyList(invalidateRef.current);
      await Promise.all(
        keys.map(async (queryKey) => {

          queryClient.removeQueries({
            queryKey,
            type: "inactive"
          });
          await queryClient.invalidateQueries({ queryKey });
        })
      );
      onSuccessRef.current?.(data, variables);
    },
    onError: (error, variables) => {
      onErrorRef.current?.(error, variables);
    }
  });
}

export default useApiMutation;
