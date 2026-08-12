"use client";

import { useEffect, useState } from "react";

type InitialValue<T> = T | (() => T);

/**
 * Mirrors useState while preserving the value for the lifetime of the browser tab.
 * The default is rendered first to keep server/client hydration consistent.
 */
export function useSessionStorageState<T>(
  key: string,
  initialValue: InitialValue<T>,
) {
  const [state, setState] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(key);
      if (stored !== null) setState(JSON.parse(stored) as T);
    } catch {
      window.sessionStorage.removeItem(key);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private browsing or when its quota is full.
    }
  }, [isHydrated, key, state]);

  return [state, setState] as const;
}
