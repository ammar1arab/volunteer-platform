"use client";
import styles from "./AdminMagazineCard.module.scss";
import { BookOpen } from "lucide-react";
import { getMonthLabel } from "@/presentation/constants/labels";

type Props = {
  title: string;
  monthYear: string;
  pdfUrl: string;
  isActive?: boolean;
  actions?: React.ReactNode;
};

const AdminMagazineCard = ({ title, monthYear, pdfUrl, actions }: Props) => {
  const date = new Date(monthYear);
  const month = getMonthLabel(date.getMonth() + 1);
  const year = date.getFullYear();

  const handleClick = async () => {
    try {
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.top} onClick={handleClick}>
        <div className={styles.left}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.datePill}>
            {month} {year}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.iconBox}>
            <BookOpen size={34} strokeWidth={1.3} />
            <span className={styles.pdfTag}>PDF</span>
          </div>
        </div>
      </div>

      {actions && (
        <div className={styles.footer} onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </article>
  );
};

export default AdminMagazineCard;