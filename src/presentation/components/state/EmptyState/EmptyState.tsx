import { LucideIcon } from "lucide-react";
import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  compact?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon: Icon, title, message, compact = false, action }: EmptyStateProps) => {
  return (
    <div className={`${styles.container} ${compact ? styles.compact : ""}`}>
      <div className={styles.content}>
        {Icon && (
          <div className={styles.icon}>
            <Icon size={compact ? 28 : 48} strokeWidth={1.5} />
          </div>
        )}
        {title && <h3 className={styles.title}>{title}</h3>}
        <p className={styles.message}>{message}</p>
        {action && (
          <button className={styles.action} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;