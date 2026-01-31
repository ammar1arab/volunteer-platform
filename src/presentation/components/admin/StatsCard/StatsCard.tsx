import { LucideIcon } from "lucide-react";
import styles from "./StatsCard.module.scss";

type Variant = "green" | "yellow" | "red" | "blue";

type Props = {
  icon: LucideIcon;
  value: number;
  label: string;
  variant: Variant;
};

const StatsCard = ({ icon: Icon, value, label, variant }: Props) => {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <Icon size={20} />
      <div className={styles.content}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
};

export default StatsCard;