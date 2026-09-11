"use client";
import { useEffect, useRef } from "react";
import styles from "./LoadingState.module.scss";

interface Props {
  compact?: boolean;
  text?: string;
  viewport?: boolean;
}

const LoadingState = ({ compact = false, text, viewport = false }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!viewport || !ref.current) return;
    const element = ref.current;
    const update = () => element.style.setProperty('--loading-top', `${Math.max(0, element.getBoundingClientRect().top)}px`);
    const observer = new ResizeObserver(update);
    document.querySelectorAll('body > header, header').forEach((header) => observer.observe(header));
    update();
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [viewport]);
  return (
    <div ref={ref} role="status" aria-label={text || 'جاري التحميل'} className={`${styles.container} ${compact ? styles.compact : ""} ${viewport ? styles.viewport : ""}`}>
      <div className={styles.loader}>
        <div className={styles.ringOuter}></div>
        <div className={styles.ringInner}></div>
        <div className={styles.glow}></div>
      </div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default LoadingState;
