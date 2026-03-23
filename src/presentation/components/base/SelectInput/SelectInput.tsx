"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [isOpen, setIsOpen]       = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef                = useRef<HTMLButtonElement>(null);
  const menuRef                   = useRef<HTMLUListElement>(null);
  const selectedOption            = options.find((o) => o.value === value);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top:      r.bottom + 8,
      left:     r.left,
      width:    r.width,
      zIndex:   99999,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    calcPosition();

    const onScroll = () => calcPosition();
    const onResize = () => calcPosition();
    const onDown   = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) return;
      setIsOpen(false);
    };

    window.addEventListener("scroll",    onScroll, true);
    window.addEventListener("resize",    onResize);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll",    onScroll, true);
      window.removeEventListener("resize",    onResize);
      document.removeEventListener("mousedown", onDown);
    };
  }, [isOpen, calcPosition]);

  const handleSelect = (v: string) => {
    onChange(v);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsOpen((p) => !p); }
    if (e.key === "Escape") setIsOpen(false);
  };

  const menu = isOpen && typeof document !== "undefined"
    ? createPortal(
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
        </ul>,
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