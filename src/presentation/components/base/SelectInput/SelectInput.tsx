"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import styles from "./SelectInput.module.scss";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

const SelectInput = ({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = "اختر...",
  required = false,
  disabled = false,
}: SelectInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const selectedOption = options.find((o) => o.value === value);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const menuHeight = 280;
    const spaceBelow = window.innerHeight - r.bottom;
    const openUpward = spaceBelow < menuHeight + 16 && r.top > menuHeight;

    setMenuStyle({
      position: "fixed",
      left: r.left,
      width: r.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: window.innerHeight - r.top + 8 }
        : { top: r.bottom + 8 }
      ),
    });
  }, []);

  const close = () => setIsOpen(false);

  const handleSelect = (v: string) => {
    onChange(v);
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsOpen((p) => !p); }
    if (e.key === "Escape") close();
  };

  const menu = isOpen && typeof document !== "undefined"
    ? createPortal(
      <>
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={close}
          style={{ position: "fixed", inset: 0, zIndex: 99998, background: "transparent", border: 0 }}
        />
        <ul
          ref={menuRef}
          className={styles.menu}
          style={menuStyle}
          role="listbox"
        >
        {options.map((o) => (
          <li
            key={o.value}
            className={`${styles.option} ${o.value === value ? styles.optionActive : ""}`}
            onClick={() => handleSelect(o.value)}
            role="option"
            aria-selected={o.value === value}
          >
            {o.label}
          </li>
        ))}
        </ul>
      </>,
      document.body
    )
    : null;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={`${styles.container} ${isOpen ? styles.open : ""} ${error ? styles.error : ""} ${disabled ? styles.disabled : ""}`}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          onClick={() => { if (!disabled) { calcPosition(); setIsOpen((p) => !p); } }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption ? styles.selected : styles.placeholder}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}
            size={20}
          />
        </button>
      </div>

      {menu}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default SelectInput;