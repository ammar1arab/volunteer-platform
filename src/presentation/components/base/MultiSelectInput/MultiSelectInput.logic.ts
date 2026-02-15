"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface UseMultiSelectProps {
  values: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  maxSelections?: number;
}

export const useMultiSelect = ({
  values,
  options,
  onChange,
  disabled = false,
  maxSelections,
}: UseMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canAddMore = !maxSelections || values.length < maxSelections;
  const selectedOptions = options.filter((o) => values.includes(o.value));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = useCallback(
    () => !disabled && setIsOpen((prev) => !prev),
    [disabled],
  );
  const handleToggle = useCallback(
    (v: string) =>
      values.includes(v)
        ? onChange(values.filter((x) => x !== v))
        : canAddMore && onChange([...values, v]),
    [values, onChange, canAddMore],
  );
  const handleRemove = useCallback(
    (v: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(values.filter((x) => x !== v));
    },
    [values, onChange],
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDropdown();
      } else if (e.key === "Escape") setIsOpen(false);
    },
    [toggleDropdown],
  );

  return {
    isOpen,
    containerRef,
    selectedOptions,
    canAddMore,
    toggleDropdown,
    handleToggle,
    handleRemove,
    handleKeyDown,
  };
};
