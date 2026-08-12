"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

type InitialValue<T> = T | (() => T);
type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const memoryFallback = new Map<string, string>();

const readRaw = (key: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;

  try {
    return window.sessionStorage.getItem(key) ?? memoryFallback.get(key) ?? fallback;
  } catch {
    return memoryFallback.get(key) ?? fallback;
  }
};

const emit = (key: string) => {
  listeners.get(key)?.forEach((listener) => listener());
};

/**
 * Mirrors useState while preserving the value for the lifetime of the browser tab.
 * useSyncExternalStore keeps browser storage reactive without effect-driven syncing.
 */
export function useSessionStorageState<T>(
  key: string,
  initialValue: InitialValue<T>,
) {
  const initialRef = useRef<{ value: T } | null>(null);
  if (initialRef.current === null) {
    initialRef.current = {
      value: typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue,
    };
  }

  const defaultRaw = useMemo(
    () => JSON.stringify(initialRef.current!.value),
    [],
  );

  const subscribe = useCallback((listener: Listener) => {
    const keyListeners = listeners.get(key) ?? new Set<Listener>();
    keyListeners.add(listener);
    listeners.set(key, keyListeners);

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea === window.sessionStorage && event.key === key) listener();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      keyListeners.delete(listener);
      if (keyListeners.size === 0) listeners.delete(key);
      window.removeEventListener("storage", handleStorage);
    };
  }, [key]);

  const getSnapshot = useCallback(
    () => readRaw(key, defaultRaw),
    [defaultRaw, key],
  );
  const getServerSnapshot = useCallback(() => defaultRaw, [defaultRaw]);
  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const state = useMemo(() => {
    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return initialRef.current!.value;
    }
  }, [rawValue]);

  const setState = useCallback<Dispatch<SetStateAction<T>>>((update) => {
    let current = initialRef.current!.value;
    try {
      current = JSON.parse(readRaw(key, defaultRaw)) as T;
    } catch {
      // Use the initial value when persisted data is malformed.
    }

    const next = typeof update === "function"
      ? (update as (previous: T) => T)(current)
      : update;
    const serialized = JSON.stringify(next);

    memoryFallback.set(key, serialized);
    try {
      window.sessionStorage.setItem(key, serialized);
    } catch {
      // The in-memory fallback keeps state reactive when storage is unavailable.
    }
    emit(key);
  }, [defaultRaw, key]);

  return [state, setState] as const;
}
