"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import styles from "./Dropdown.module.scss";

type DropdownItem = {
  key: string;
  label: string;
  count?: number;
};

type Props = {
  items: DropdownItem[];
  active: string;
  onChange: (key: string) => void;
  placeholder?: string;
  compact?: boolean;
};

const Dropdown = ({ items, active, onChange, placeholder = "اختر...", compact = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = items.find((item) => item.key === active);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleSelect = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.dropdown} ${compact ? styles.compactWrapper : ""}`} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ""} ${compact ? styles.compact : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.label}>
          {activeItem?.label || placeholder}
          {activeItem?.count !== undefined && (
            <span className={styles.badge}>{activeItem.count}</span>
          )}
        </span>
        <ChevronDown size={compact ? 14 : 16} className={styles.icon} />
      </button>

      {isOpen && (
        <div className={`${styles.menu} no-scrollbar`}>
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.item} ${item.key === active ? styles.selected : ""}`}
              onClick={() => handleSelect(item.key)}
            >
              <span className={styles.itemLabel}>
                {item.label}
                {item.count !== undefined && (
                  <span className={styles.itemCount}>{item.count}</span>
                )}
              </span>
              {item.key === active && <Check size={16} className={styles.check} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;