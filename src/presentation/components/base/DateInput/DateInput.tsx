"use client";

import { Calendar } from "lucide-react";
import styles from "./DateInput.module.scss";

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
}

const DateInput = ({
  label,
  value,
  onChange,
  error,
  min,
  max,
  required = false,
  disabled = false,
}: DateInputProps) => {
  const inputId = `date-input-${label.replace(/\s+/g, "-")}`;

  const openPicker = () => {
    if (disabled) return;
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (!input) return;

    input.focus();
    input.showPicker?.(); // native modern modal 🔥
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div
        className={`${styles.inputContainer} ${error ? styles.error : ""} ${
          disabled ? styles.disabled : ""
        }`}
        onClick={openPicker}
      >
        <input
          id={inputId}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          className={styles.input}
          aria-label={label}
          aria-required={required}
        />

        <Calendar className={styles.icon} size={18} />
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default DateInput;
