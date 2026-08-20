"use client";
import styles from "./MagazineCard.module.scss";
import { BookOpen, Download } from "lucide-react";
import { ExternalLink, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { useSession } from "next-auth/react";
import { useToast } from "@/presentation/hooks/uiHooks/useToast";

type Props = { title: string; monthYear: string; pdfUrl: string; };

const MagazineCard = ({ title, monthYear, pdfUrl }: Props) => {
  const formattedDate = formatDate(monthYear);

  const { status } = useSession();
  const { showToast } = useToast();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 

    if (status === "loading") {
      showToast("جاري التحقق من الحساب، يرجى الانتظار...", "info");
      return;
    }

    if (status !== "authenticated") {
      showToast("يرجى تسجيل الدخول لتحميل المجلة", "error");
      return;
    }

    try {
      showToast("بدأ التحميل...", "info");
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `${title}.pdf`
      });

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
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
        <div className={styles.datePill}>{formattedDate}</div>
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