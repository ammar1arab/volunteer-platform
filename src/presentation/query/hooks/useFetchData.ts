"use client";

import { type QueryKey, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useRef } from "react";
import { isNotFoundError } from "../utils/errors";

export interface UseFetchDataOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: boolean | number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | "always";
  refetchOnReconnect?: boolean;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;

  cacheEnabled?: boolean;
}

export interface UseFetchDataParams<TData> {
  queryKey: QueryKey;
  request: () => Promise<TData>;
  options?: UseFetchDataOptions;
  callback?: (data: TData) => void;
  errorCallback?: (error: Error) => void;
}

export type UseFetchDataResult<TData> = UseQueryResult<TData, Error> & {
  isNotFound: boolean;
};

export function useFetchData<TData>({
  queryKey,
  request,
  options,
  callback,
  errorCallback
}: UseFetchDataParams<TData>): UseFetchDataResult<TData> {
  const requestRef = useRef(request);
  requestRef.current = request;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const errorCallbackRef = useRef(errorCallback);
  errorCallbackRef.current = errorCallback;

  const {
    cacheEnabled: _cacheEnabled,
    refetchIntervalInBackground = false,
    retry = false,
    refetchOnWindowFocus = false,
    ...rest
  } = options ?? {};

  const queryResult = useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const data = await requestRef.current();
        callbackRef.current?.(data);
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errorCallbackRef.current?.(err);
        throw err;
      }
    },
    retry,
    refetchOnWindowFocus,
    refetchIntervalInBackground,
    ...rest
  });

  return {
    ...queryResult,
    isNotFound: isNotFoundError(queryResult.error)
  } as UseFetchDataResult<TData>;
}
