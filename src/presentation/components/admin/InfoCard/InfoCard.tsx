import { LucideIcon } from "lucide-react";
import styles from "./InfoCard.module.scss";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
  isEditable?: boolean;
  onEdit?: () => void;
};

const InfoCard = ({ icon: Icon, label, value, isEditable = false, onEdit }: Props) => {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <Icon size={18} />
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        {typeof value === "string" ? <span className={styles.value}>{value}</span> : value}
      </div>
    </div>
  );
};

export default InfoCard;