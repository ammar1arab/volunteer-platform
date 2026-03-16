import styles from "./LoadingState.module.scss";

interface Props {
  compact?: boolean;
}

const LoadingState = ({ compact = false }: Props) => {
  return (
    <div className={`${styles.container} ${compact ? styles.compact : ""}`}>
      <div className={styles.loader}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
};

export default LoadingState;