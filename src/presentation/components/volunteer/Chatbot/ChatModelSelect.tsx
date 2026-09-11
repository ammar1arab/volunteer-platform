"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import type { ChatModelOptionDto, ChatProviderId } from "@/core/application/dtos";
import { useIsClient } from "@/presentation/query";
import styles from "./Chatbot.module.scss";

type Props = {
  models: ChatModelOptionDto[];
  value: ChatProviderId;
  onChange: (model: ChatProviderId) => void;
};

type Coords = { top: number; left: number; width: number };

const ChatModelSelect = ({ models, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const mounted = useIsClient();

  const active = models.find((model) => model.id === value) ?? models[0];
  const label = active?.label ?? "Auto";

  const placeMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, 168);
    const left = Math.min(rect.left, window.innerWidth - width - 12);
    setCoords({
      top: Math.round(rect.bottom + 6),
      left: Math.round(Math.max(12, left)),
      width: Math.round(width),
    });
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onReposition = () => placeMenu();

    placeMenu();
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [close, open, placeMenu]);

  return (
    <div className={styles.modelSelect} ref={rootRef} dir="ltr">
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.modelTrigger} ${open ? styles.modelTriggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (open) {
            close();
            return;
          }
          placeMenu();
          setOpen(true);
        }}
      >
        <span>{label}</span>
        <ChevronDown size={14} />
      </button>

      {open && mounted && coords
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              className={styles.modelMenu}
              role="listbox"
              aria-label="Model"
              style={{ top: coords.top, left: coords.left, width: coords.width }}
            >
              {models.map((model) => {
                const selected = model.id === (active?.id ?? "auto");
                return (
                  <button
                    key={model.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`${styles.modelOption} ${selected ? styles.modelOptionOn : ""}`}
                    onClick={() => {
                      onChange(model.id);
                      close();
                    }}
                  >
                    <span>{model.label}</span>
                    {selected && <Check size={14} />}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default ChatModelSelect;
