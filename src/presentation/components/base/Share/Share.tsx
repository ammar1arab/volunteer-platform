"use client";
import styles from "./Share.module.scss";
import { X, Link2, Check } from "lucide-react";
import { useState } from "react";
import { useShare, type SharePayload } from "./Share.logic";
import { createPortal } from "react-dom";
import Button from "../Button/Button";

type ShareProps = {
  trigger: (open: (p: SharePayload) => void) => React.ReactNode;
};

const Share = ({ trigger }: ShareProps) => {
  const { isOpen, payload, open, close, getLinks } = useShare();
  const [copied, setCopied] = useState(false);
  const [copiedApp, setCopiedApp] = useState<string | null>(null);

  const handleCopy = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppCopy = (label: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopiedApp(label);
    setTimeout(() => setCopiedApp(null), 2000);
  };

  const links = payload ? getLinks(payload) : [];

  return (
    <>
      {trigger(open)}
      {isOpen && payload && createPortal(
        <div
          className={styles.overlay}
          data-modal-open=""
          onClick={close}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
          >
            <div className={styles.header}>
              <h3 className={styles.title}>مشاركة</h3>
              <button className={styles.closeBtn} onClick={close}><X size={16} /></button>
            </div>

            <p className={styles.subtitle}>{payload.title}</p>

            <div className={styles.grid}>
              {links.map((link) => (
                link.copyOnClick ? (
                  <button key={link.label}
                    className={`${styles.item} ${styles.itemBtn}`}
                    style={{ "--app-color": link.bg } as React.CSSProperties}
                    onClick={() => handleAppCopy(link.label)}>
                    <div className={styles.iconWrapper}
                      dangerouslySetInnerHTML={{ __html: copiedApp === link.label ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>` : link.icon }} />
                    <span className={styles.label}>
                      {copiedApp === link.label ? "تم النسخ!" : link.label}
                    </span>
                  </button>
                ) : (
                  <a key={link.label} href={link.href!} target="_blank" rel="noopener noreferrer"
                    className={styles.item}
                    style={{ "--app-color": link.bg } as React.CSSProperties}>
                    <div className={styles.iconWrapper}
                      dangerouslySetInnerHTML={{ __html: link.icon }} />
                    <span className={styles.label}>{link.label}</span>
                  </a>
                )
              ))}
            </div>

            <div className={styles.divider} />

            <Button className={styles.copyBtn} variant="secondary" onClick={handleCopy} fullWidth>
              {copied ? <Check size={15} /> : <Link2 size={15} />}
              {copied ? "تم نسخ الرابط!" : "نسخ رابط الصفحة"}
            </Button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Share;