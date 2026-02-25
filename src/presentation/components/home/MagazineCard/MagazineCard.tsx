"use client";
import styles from "./MagazineCard.module.scss";
import { BookOpen, Download } from "lucide-react";
import { getMonthLabel } from "@/presentation/constants/labels";

type Props = { title: string; monthYear: string; pdfUrl: string; };

const MagazineCard = ({ title, monthYear, pdfUrl }: Props) => {
  const date  = new Date(monthYear);
  const month = getMonthLabel(date.getMonth() + 1);
  const year  = date.getFullYear();

  const handleClick = async () => {
    try {
      const blob = await (await fetch(pdfUrl)).blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: `${title}.pdf` });
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { window.open(pdfUrl, "_blank", "noopener,noreferrer"); }
  };

  return (
    <article className={styles.card} onClick={handleClick}>
      <div className={styles.iconArea}>
        <div className={styles.ringOuter} />
        <div className={styles.ring} />
        <div className={styles.iconBox}>
          <BookOpen size={42} strokeWidth={1.1} />
          <span className={styles.pdfTag}>PDF</span>
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.datePill}>{month} {year}</div>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.downloadBtn}>
          <Download size={12} />
          تحميل المجلة
        </div>
      </div>
    </article>
  );
};

export default MagazineCard;