import { LucideIcon, Loader2 } from "lucide-react";
import styles from "./StatsCard.module.scss";

type Variant = "green" | "yellow" | "red" | "blue";

type Props = {
  icon: LucideIcon;
  value: number | string;
  title?: string;
  label?: string;
  color?: Variant;
  variant?: Variant;
  loading?: boolean;
};

const StatsCard = ({ icon: Icon, value, title, label, color, variant, loading }: Props) => {
  const displayLabel = title || label;
  const displayVariant = color || variant || "blue";

  return (
    <div className={`${styles.card} ${styles[displayVariant]}`}>
      <div className={styles.iconWrapper}>
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{displayLabel}</span>
        <span className={styles.value}>
          {loading ? <Loader2 size={20} className={styles.spinner} /> : value}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;