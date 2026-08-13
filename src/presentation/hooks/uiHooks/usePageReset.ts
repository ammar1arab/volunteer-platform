"use client";

import { type Dispatch, type SetStateAction, useCallback } from "react";

export function usePageReset<T>(
  setValue: Dispatch<SetStateAction<T>>,
  setPage: Dispatch<SetStateAction<number>>
): Dispatch<SetStateAction<T>> {
  return useCallback(
    (value: SetStateAction<T>) => {
      setValue(value);
      setPage(1);
    },
    [setValue, setPage]
  );
}
