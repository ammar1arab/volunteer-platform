"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "./LoadingState.module.scss";

interface Props {
  compact?: boolean;
  fill?: boolean;
  text?: string;
  viewport?: boolean;
}

const LoadingState = ({ compact = false, fill = false, text, viewport = false }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const fillRemaining = viewport || (!compact && !fill);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !fillRemaining) return;

    const update = () => {
      const top = Math.max(0, Math.round(element.getBoundingClientRect().top));
      element.style.setProperty("--loading-top", `${top}px`);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [fillRemaining]);

  const className = [
    styles.container,
    compact ? styles.compact : "",
    fill ? styles.fill : "",
    fillRemaining ? styles.viewport : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} role="status" aria-label={text || "جاري التحميل"} className={className}>
      <div className={styles.loader}>
        <div className={styles.ringOuter} />
        <div className={styles.ringInner} />
        <div className={styles.glow} />
      </div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default LoadingState;
