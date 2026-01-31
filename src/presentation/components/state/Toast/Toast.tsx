"use client";

import { X } from "lucide-react";
import { useToastTimer, ICONS, type ToastType } from "./Toast.logic";
import styles from "./Toast.module.scss";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 5000 }: ToastProps) => {
  const Icon = ICONS[type];
  
  useToastTimer(onClose, duration);

  return (
    <div className={styles.toast} data-type={type}>
      <div className={styles.iconWrapper}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>
        <X size={16} />
      </button>
      <div className={styles.progress} />
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};