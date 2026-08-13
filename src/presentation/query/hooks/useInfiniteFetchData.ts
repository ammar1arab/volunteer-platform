"use client";

import {
  type InfiniteData,
  type QueryKey,
  useInfiniteQuery,
  type UseInfiniteQueryResult
} from "@tanstack/react-query";
import { useRef } from "react";

export interface InfiniteFetchDataOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: boolean | number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | "always";
  refetchOnReconnect?: boolean;
}

export interface UseInfiniteFetchDataParams<TPage> {
  queryKey: QueryKey;
  request: (pageParam: number) => Promise<TPage>;
  getNextPageParam: (lastPage: TPage) => number | undefined;
  initialPageParam?: number;
  options?: InfiniteFetchDataOptions;
  callback?: (data: TPage) => void;
  errorCallback?: (error: Error) => void;
}

export function useInfiniteFetchData<TPage>({
  queryKey,
  request,
  getNextPageParam,
  initialPageParam = 1,
  options,
  callback,
  errorCallback
}: UseInfiniteFetchDataParams<TPage>): UseInfiniteQueryResult<InfiniteData<TPage>, Error> {
  const requestRef = useRef(request);
  requestRef.current = request;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const errorCallbackRef = useRef(errorCallback);
  errorCallbackRef.current = errorCallback;

  return useInfiniteQuery<TPage, Error, InfiniteData<TPage>, QueryKey, number>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      try {
        const data = await requestRef.current(pageParam);
        callbackRef.current?.(data);
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errorCallbackRef.current?.(err);
        throw err;
      }
    },
    initialPageParam,
    getNextPageParam,
    retry: false,
    refetchOnWindowFocus: false,
    ...(options ?? {})
  });
}
