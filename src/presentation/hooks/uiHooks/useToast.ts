"use client";

import { ToastType } from "@/presentation/components/state/Toast/Toast.logic";
import { useState, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToasts((prev) => {
      const next = prev.filter((toast) => toast.message !== message || toast.type !== type);
      return [...next, { id: `${Date.now()}-${Math.random()}`, message, type }];
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};