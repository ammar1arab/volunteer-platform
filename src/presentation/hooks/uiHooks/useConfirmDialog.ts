"use client";

import { useCallback, useState } from "react";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  warning?: string;
};

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: "" });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolver?.(true);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolver?.(false);
    setResolver(null);
  }, [resolver]);

  return {
    confirm,
    confirmDialog: {
      isOpen,
      options,
      handleConfirm,
      handleCancel
    }
  };
}
