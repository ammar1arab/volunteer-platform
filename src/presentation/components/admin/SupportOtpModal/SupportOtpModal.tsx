"use client";

import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import { Modal, Button, OtpInput, LoadingState } from "@/presentation/components";
import { OtpType } from "@/core/domain/enums";
import styles from "./SupportOtpModal.module.scss";

export type SupportOtpType = typeof OtpType.FORGOT_PASSWORD | typeof OtpType.EMAIL_VERIFY;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  type: SupportOtpType;
  onTypeChange: (type: SupportOtpType) => void;
  code: string[] | null;
  loading: boolean;
  error: string | null;
  onReissue: () => void;
};

const TYPE_OPTIONS: { value: SupportOtpType; label: string }[] = [
  { value: OtpType.FORGOT_PASSWORD, label: "استعادة كلمة المرور" },
  { value: OtpType.EMAIL_VERIFY, label: "تفعيل البريد" },
];

const SupportOtpModal = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  type,
  onTypeChange,
  code,
  loading,
  error,
  onReissue,
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
            رمز لمرة واحدة لـ <strong>{userName}</strong>
          </p>
          <p className={styles.email}>{userEmail}</p>
        </header>

        <div className={styles.typeRow} role="tablist" aria-label="نوع الرمز">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={type === opt.value}
              className={`${styles.typeBtn} ${type === opt.value ? styles.typeActive : ""}`}
              onClick={() => {
                setCopied(false);
                onTypeChange(opt.value);
              }}
              disabled={loading}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && <div className={styles.error} role="alert">{error}</div>}

        {loading && !code ? (
          <LoadingState compact />
        ) : code ? (
          <>
            <OtpInput value={code} onChange={() => undefined} disabled autoFocus={false} />
            <p className={styles.hint}>يُحذف الرمز تلقائياً من قاعدة البيانات بعد استخدامه مرة واحدة.</p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="md"
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopy}
              >
                {copied ? "تم النسخ" : "نسخ الرمز"}
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={loading}
                onClick={() => {
                  setCopied(false);
                  onReissue();
                }}
              >
                إعادة الإصدار
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default SupportOtpModal;
