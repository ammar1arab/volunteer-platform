"use client";
import { useState } from "react";
import { Input } from "@/presentation/components";
import styles from "./PasswordField.module.scss";

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`${styles.eyeSvg} ${open ? styles.open : ""}`}
    viewBox="0 0 24 24" fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={styles.lid}
    />
    <circle cx="12" cy="12" r="3" className={styles.pupil} />
    <line
      x1="4" y1="4" x2="20" y2="20"
      strokeWidth="1.5" strokeLinecap="round"
      className={`${styles.slash} ${open ? styles.slashGone : ""}`}
    />
  </svg>
);

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  autoComplete?: string;
  autoFocus?: boolean;
}

const PasswordField = ({ label, value, onChange, onBlur, autoComplete, autoFocus }: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.wrap}>
      <Input
        label={label}
        type={show ? "text" : "password"}
        dir="ltr"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className={styles.eyeBtn}
        onClick={() => setShow(s => !s)}
        aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        tabIndex={-1}
      >
        <span className={styles.ripple} />
        <EyeIcon open={show} />
      </button>
    </div>
  );
};

export default PasswordField;