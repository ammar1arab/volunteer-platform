"use client";

import {
  type InfiniteData,
  type QueryKey,
  useInfiniteQuery,
  type UseInfiniteQueryResult
} from "@tanstack/react-query";

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
  return useInfiniteQuery<TPage, Error, InfiniteData<TPage>, QueryKey, number>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      try {
        const data = await request(pageParam);
        callback?.(data);
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errorCallback?.(err);
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
