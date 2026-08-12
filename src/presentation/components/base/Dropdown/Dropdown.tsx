"use client";
import { useState, useRef, useEffect, useCallback } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeItem = items.find((item) => item.key === active);

  const placeMenu = useCallback(() => {
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!menu || !trigger || !compact) return;

    const isMobile = window.matchMedia("(max-width: 599px)").matches;
    if (!isMobile) {
      menu.style.position = "";
      menu.style.top = "";
      menu.style.left = "";
      menu.style.right = "";
      menu.style.width = "";
      menu.style.minWidth = "";
      menu.style.maxWidth = "";
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const margin = 16;
    const width = Math.min(340, window.innerWidth - margin * 2);
    let left = rect.left;
    if (left + width > window.innerWidth - margin) {
      left = window.innerWidth - margin - width;
    }
    if (left < margin) left = margin;

    menu.style.position = "fixed";
    menu.style.top = `${Math.round(rect.bottom + 4)}px`;
    menu.style.left = `${Math.round(left)}px`;
    menu.style.right = "auto";
    menu.style.width = `${width}px`;
    menu.style.minWidth = `${width}px`;
    menu.style.maxWidth = `${width}px`;
  }, [compact]);

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

  useEffect(() => {
    if (!isOpen) return;
    placeMenu();
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [isOpen, placeMenu, items]);

  const handleSelect = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.dropdown} ${compact ? styles.compactWrapper : ""}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
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
        <div ref={menuRef} className={`${styles.menu} ${compact ? styles.compactMenu : ""} no-scrollbar`}>
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
