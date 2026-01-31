"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import styles from "./ConfirmDialog.module.scss";
import { Modal } from "@/presentation/components";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "تأكيد العملية",
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
}: Props) => {
  const Icon = variant === "danger" ? AlertTriangle : CheckCircle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={styles.content}>
        <div className={`${styles.icon} ${styles[variant]}`}>
          <Icon size={20} />
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            {cancelText}
          </button>
          <button className={`${styles.confirm} ${styles[variant]}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;