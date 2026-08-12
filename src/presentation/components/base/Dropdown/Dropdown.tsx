"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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

type MenuCoords = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const Dropdown = ({ items, active, onChange, placeholder = "اختر...", compact = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeItem = items.find((item) => item.key === active);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateCoords();
    const onReposition = () => updateCoords();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [isOpen, updateCoords, items]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const handleSelect = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  const menu =
    isOpen && mounted && coords
      ? createPortal(
          <div
            ref={menuRef}
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
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`${styles.dropdown} ${compact ? styles.compactWrapper : ""}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ""} ${compact ? styles.compact : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
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
