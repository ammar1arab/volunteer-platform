import { LucideIcon } from "lucide-react";
import styles from "./StatsCard.module.scss";

type Variant = "primary" | "success" | "warning" | "danger" | "info" | "violet" | "pink" | "orange" | "teal";

type Props = {
  icon: LucideIcon;
  value: number | string;
  title?: string;
  label?: string;
  variant?: Variant;
  loading?: boolean;
  onClick?: () => void;
};

const StatsCard = ({ icon: Icon, value, title, label, variant = "primary", loading, onClick }: Props) => {
  const displayLabel = title || label;

  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${onClick ? styles.clickable : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.iconWrapper}>
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{displayLabel}</span>
        <span className={styles.value}>
          {loading ? <div className={styles.skeletonValue} /> : value}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;