import styles from "./LoadingState.module.scss";
import { loadingSoundDataUri } from "@/presentation/utils/loadingSound";

interface Props {
  compact?: boolean;
  text?: string;
}

const LoadingState = ({ compact = false, text }: Props) => {
  return (
    <div className={`${styles.container} ${compact ? styles.compact : ""}`}>
      <audio src={loadingSoundDataUri} autoPlay style={{ display: 'none' }} />
      <div className={styles.loader}>
        <div className={styles.pulse}></div>
        <div className={styles.pulse}></div>
      </div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default LoadingState;