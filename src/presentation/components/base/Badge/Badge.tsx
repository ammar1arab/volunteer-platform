import styles from "./Badge.module.scss";

type BadgeVariant = "success" | "danger" | "warning" | "info" | "neutral";

type Props = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

const Badge = ({ children, variant = "neutral" }: Props) => {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
};

export default Badge;