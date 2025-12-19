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
          <div key={i} className={styles.skeleton} />
        ))}
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default LoadingState;