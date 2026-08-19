import styles from "./LoadingState.module.scss";

interface Props {
  compact?: boolean;
  text?: string;
}

const LoadingState = ({ compact = false, text }: Props) => {
  return (
    <div className={`${styles.container} ${compact ? styles.compact : ""}`}>
      <div className={styles.spinner}>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.dot}></div>
      </div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default LoadingState;