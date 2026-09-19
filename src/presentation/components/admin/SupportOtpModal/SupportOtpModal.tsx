"use client";

import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import { Modal, Button, OtpInput, LoadingState } from "@/presentation/components";
import styles from "./SupportOtpModal.module.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  code: string[] | null;
  loading: boolean;
  error: string | null;
};

const SupportOtpModal = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  code,
  loading,
  error,
}: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.join(""));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="رمز تحقق الدعم" size="sm">
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <KeyRound size={22} className={styles.icon} />
          <p className={styles.subtitle}>
            رمز واحد لـ <strong>{userName}</strong>
          </p>
          <p className={styles.email}>{userEmail}</p>
        </header>

        {error && <div className={styles.error} role="alert">{error}</div>}

        {loading && !code ? (
          <LoadingState compact />
        ) : code ? (
          <>
            <OtpInput value={code} onChange={() => undefined} disabled autoFocus={false} />
            <p className={styles.hint}>
              يعمل لتفعيل البريد واستعادة كلمة المرور. يبقى نفسه حتى يُستخدم أو تنتهي صلاحيته خلال 24 ساعة.
            </p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopy}
              >
                {copied ? "تم النسخ" : "نسخ الرمز"}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default SupportOtpModal;
