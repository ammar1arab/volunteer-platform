import styles from "./LoadingState.module.scss";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton";
  count?: number;
  message?: string;
}

const LoadingState = ({ variant = "spinner", count = 6, message }: LoadingStateProps) => {
  if (variant === "skeleton") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.skeleton}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default LoadingState;