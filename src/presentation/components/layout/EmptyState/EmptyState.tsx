import { LucideIcon } from "lucide-react";
import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon: Icon, title, message, action }: EmptyStateProps) => {
  return (
    <div className={styles.container}>
      {Icon && (
        <div className={styles.icon}>
          <Icon size={48} strokeWidth={1.5} />
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
  );
};

export default EmptyState;