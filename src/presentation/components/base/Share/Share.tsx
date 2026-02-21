"use client";
import styles from "./Share.module.scss";
import { X, Link2, Check } from "lucide-react";
import { useState } from "react";
import { useShare, type SharePayload } from "./Share.logic";
import { createPortal } from "react-dom";

type ShareProps = {
  trigger: (open: (p: SharePayload) => void) => React.ReactNode;
};

const Share = ({ trigger }: ShareProps) => {
  const { isOpen, payload, open, close, getLinks } = useShare();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const links = payload ? getLinks(payload) : [];

  return (
    <>
      {trigger(open)}
      {isOpen && payload && createPortal(
        <div className={styles.overlay} onClick={close}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h3 className={styles.title}>مشاركة</h3>
              <button className={styles.closeBtn} onClick={close}><X size={16} /></button>
            </div>

            <p className={styles.subtitle}>{payload.title}</p>

            <div className={styles.grid}>
              {links.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  className={styles.item}
                  style={{ "--app-color": link.bg } as React.CSSProperties}>
                  <div className={styles.iconWrapper}
                    dangerouslySetInnerHTML={{ __html: link.icon }} />
                  <span className={styles.label}>{link.label}</span>
                </a>
              ))}
            </div>

            <div className={styles.divider} />

            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? <Check size={15} /> : <Link2 size={15} />}
              {copied ? "تم النسخ!" : "نسخ الرابط"}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Share;