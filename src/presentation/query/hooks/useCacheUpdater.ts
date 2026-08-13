"use client";

import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

export function useCacheUpdater<TData>(queryKey: QueryKey): {
  updateData: (newData: TData | ((prev: TData | undefined) => TData)) => void;
  getData: () => TData | undefined;
} {
  const queryClient = useQueryClient();
  const keyRef = useRef(queryKey);
  keyRef.current = queryKey;

  const updateData = useCallback(
    (newData: TData | ((prev: TData | undefined) => TData)): void => {
      if (typeof newData === "function") {
        queryClient.setQueryData<TData>(keyRef.current, (prev) =>
          (newData as (prev: TData | undefined) => TData)(prev)
        );
        return;
      }
      queryClient.setQueryData(keyRef.current, newData);
    },
    [queryClient]
  );

  const getData = useCallback(
    (): TData | undefined => queryClient.getQueryData<TData>(keyRef.current),
    [queryClient]
  );

  return { updateData, getData };
}

export default useCacheUpdater;
