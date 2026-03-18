"use client";

import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        ref={containerRef}
        className={`${styles.container} ${isOpen ? styles.open : ""} ${error ? styles.error : ""
          } ${disabled ? styles.disabled : ""}`}
      >
        <button
          type="button"
          className={styles.trigger}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label}
        >
          <span className={selectedOption ? styles.selected : styles.placeholder}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}
            size={20}
          />
        </button>

        {isOpen && (
          <ul className={`${styles.menu} no-scrollbar`} role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                className={`${styles.option} ${option.value === value ? styles.optionActive : ""
                  }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default SelectInput;