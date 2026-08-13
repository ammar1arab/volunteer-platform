"use client";
import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import styles from "./OtpInput.module.scss";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

const OtpInput = ({ value, onChange, onComplete, disabled, autoFocus = true }: Props) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const emit = (next: string[]) => {
    onChange(next);
    const full = next.join("");
    if (full.length === 6 && next.every(Boolean)) onComplete?.(full);
  };

  const distribute = (digits: string[], startIndex = 0) => {
    const next = [...value];
    digits.forEach((d, i) => { if (startIndex + i < 6) next[startIndex + i] = d; });
    emit(next);
    setTimeout(() => refs.current[Math.min(startIndex + digits.length, 5)]?.focus(), 0);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = [...value];
      next[index] = "";
      emit(next);
      return;
    }
    if (raw.length > 1) {
      distribute(raw.slice(0, 6).split(""), index);
      return;
    }
    const next = [...value];
    next[index] = raw;
    emit(next);
    if (index < 5) setTimeout(() => refs.current[index + 1]?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        const next = [...value];
        next[index] = "";
        emit(next);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const next = [...value];
        next[index - 1] = "";
        emit(next);
      }
    }
    if (e.key === "ArrowLeft"  && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    distribute(digits, 0);
  };

  return (
    <div className={styles.wrapper} dir="ltr">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={value[i] ?? ""}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          className={`${styles.box} ${value[i] ? styles.filled : ""} ${disabled ? styles.disabled : ""}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;