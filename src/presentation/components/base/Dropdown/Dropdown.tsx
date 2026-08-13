"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { useIsClient } from "@/presentation/query";
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

type MenuCoords = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const Dropdown = ({ items, active, onChange, placeholder = "اختر...", compact = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mounted = useIsClient();

  const activeItem = items.find((item) => item.key === active);

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const margin = 12;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const preferredWidth = compact
      ? Math.max(rect.width, Math.min(280, viewportW - margin * 2))
      : Math.max(rect.width, Math.min(320, viewportW - margin * 2));
    const width = Math.min(preferredWidth, viewportW - margin * 2);

    let left = rect.left;
    if (left + width > viewportW - margin) left = viewportW - margin - width;
    if (left < margin) left = margin;

    const spaceBelow = viewportH - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(280, openUp ? spaceAbove - 4 : spaceBelow - 4));
    const top = openUp ? Math.max(margin, rect.top - maxHeight - 4) : rect.bottom + 4;

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      width: Math.round(width),
      maxHeight: Math.round(maxHeight)
    });
  }, [compact]);

  const close = () => setIsOpen(false);

  const handleSelect = (key: string) => {
    onChange(key);
    close();
  };

  const menu =
    isOpen && mounted && coords
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="إغلاق القائمة"
              onClick={close}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
              }}
              style={{ position: "fixed", inset: 0, zIndex: 3999, background: "transparent", border: 0 }}
            />
            <div
              className={`${styles.menu} ${compact ? styles.compactMenu : ""} no-scrollbar`}
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight,
                zIndex: 4000
              }}
              role="listbox"
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
              }}
            >
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  aria-selected={item.key === active}
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
          </>,
          document.body
        )
      : null;

  return (
    <div className={`${styles.dropdown} ${compact ? styles.compactWrapper : ""}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ""} ${compact ? styles.compact : ""}`}
        onClick={() => {
          if (isOpen) {
            close();
            return;
          }
          updateCoords();
          setIsOpen(true);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.label}>
          {activeItem?.label || placeholder}
          {activeItem?.count !== undefined && (
            <span className={styles.badge}>{activeItem.count}</span>
          )}
        </span>
        <ChevronDown size={compact ? 14 : 16} className={styles.icon} />
      </button>
      {menu}
    </div>
  );
};

export default Dropdown;
