"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/presentation/components";
import styles from "./useConfirmDialog.module.scss";

type ConfirmOptions = {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary";
};

export function useConfirmDialog() {
    const resolverRef = useRef<((v: boolean) => void) | null>(null);

    const [open, setOpen] = useState(false);
    const [opts, setOpts] = useState<ConfirmOptions>({
        title: "تأكيد العملية",
        message: "",
        confirmText: "تأكيد",
        cancelText: "إلغاء",
        variant: "danger",
    });

    const confirm = useCallback((options: ConfirmOptions) => {
        setOpts((p) => ({
            ...p,
            ...options,
            title: options.title ?? "تأكيد العملية",
            confirmText: options.confirmText ?? "تأكيد",
            cancelText: options.cancelText ?? "إلغاء",
            variant: options.variant ?? "danger",
        }));
        setOpen(true);

        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const close = useCallback((result: boolean) => {
        setOpen(false);
        resolverRef.current?.(result);
        resolverRef.current = null;
    }, []);

    const ConfirmDialog = useMemo(() => {
        return function ConfirmDialogComponent() {
            return (
                <Modal isOpen={open} onClose={() => close(false)} title={opts.title!} size="sm">
                    <div className={styles.wrap} dir="rtl">
                        <div className={styles.icon}>
                            <AlertTriangle size={22} />
                        </div>

                        <p className={styles.message}>{opts.message}</p>

                        <div className={styles.actions}>
                            <button className={styles.cancel} onClick={() => close(false)}>
                                {opts.cancelText}
                            </button>

                            <button
                                className={`${styles.confirm} ${opts.variant === "danger" ? styles.danger : styles.primary}`}
                                onClick={() => close(true)}
                            >
                                {opts.confirmText}
                            </button>
                        </div>
                    </div>
                </Modal>
            );
        };
    }, [open, opts, close]);

    return { confirm, ConfirmDialog };
}
