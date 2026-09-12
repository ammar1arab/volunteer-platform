"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/presentation/query";
import styles from "./Tooltip.module.scss";

export type TooltipSide = "top" | "bottom" | "left" | "right";

type Props = {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  offset?: number;
  delay?: number;
  open?: boolean;
};

const EDGE = 10;
const ARROW = 10;

const Tooltip = ({ content, children, side = "top", offset = 10, delay = 220, open = false }: Props) => {
  const [hover, setHover] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const mounted = useIsClient();

  const hide = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setHover(null);
  }, []);

  const show = useCallback(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setHover(rect);
    }, delay);
  }, [delay]);

  const live = open ? triggerRef.current?.getBoundingClientRect() ?? null : null;
  const anchor = hover ?? live;

  const place = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !anchor) return;

      const box = node.getBoundingClientRect();
      const { innerWidth: vw, innerHeight: vh } = window;
      const fitsAbove = anchor.top - box.height - offset >= EDGE;
      const fitsBelow = anchor.bottom + box.height + offset <= vh - EDGE;

      let placement = side;
      if (side === "top" && !fitsAbove) placement = "bottom";
      if (side === "bottom" && !fitsBelow) placement = "top";

      const clamp = (value: number, size: number, max: number) =>
        Math.min(Math.max(value, EDGE), Math.max(EDGE, max - size - EDGE));

      const horizontal = placement === "left" || placement === "right";
      const left = horizontal
        ? placement === "left"
          ? anchor.left - box.width - offset
          : anchor.right + offset
        : clamp(anchor.left + anchor.width / 2 - box.width / 2, box.width, vw);
      const top = horizontal
        ? clamp(anchor.top + anchor.height / 2 - box.height / 2, box.height, vh)
        : placement === "top"
          ? anchor.top - box.height - offset
          : anchor.bottom + offset;

      const midX = anchor.left + anchor.width / 2 - left;
      const midY = anchor.top + anchor.height / 2 - top;
      const arrowX = Math.min(Math.max(midX, ARROW), box.width - ARROW);
      const arrowY = Math.min(Math.max(midY, ARROW), box.height - ARROW);

      node.style.left = `${Math.round(left)}px`;
      node.style.top = `${Math.round(top)}px`;
      node.style.setProperty("--arrow-x", `${Math.round(arrowX)}px`);
      node.style.setProperty("--arrow-y", `${Math.round(arrowY)}px`);
      node.dataset.placement = placement;
      node.dataset.ready = "true";
    },
    [anchor, offset, side]
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={styles.trigger}
        onPointerEnter={show}
        onPointerLeave={hide}
        onPointerDown={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {anchor &&
        mounted &&
        createPortal(
          <div ref={place} role="tooltip" className={styles.bubble}>
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
