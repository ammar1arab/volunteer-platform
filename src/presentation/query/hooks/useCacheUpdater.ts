"use client";

import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useCacheUpdater<TData>(queryKey: QueryKey): {
  updateData: (newData: TData | ((prev: TData | undefined) => TData)) => void;
  getData: () => TData | undefined;
} {
  const queryClient = useQueryClient();

  const updateData = useCallback(
    (newData: TData | ((prev: TData | undefined) => TData)): void => {
      if (typeof newData === "function") {
        queryClient.setQueryData<TData>(queryKey, (prev) =>
          (newData as (prev: TData | undefined) => TData)(prev)
        );
        return;
      }
      queryClient.setQueryData(queryKey, newData);
    },
    [queryClient, queryKey]
  );

  const getData = useCallback(
    (): TData | undefined => queryClient.getQueryData<TData>(queryKey),
    [queryClient, queryKey]
  );

  return { updateData, getData };
}

export default useCacheUpdater;
