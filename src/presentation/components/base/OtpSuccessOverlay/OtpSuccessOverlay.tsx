import styles from "./OtpSuccessOverlay.module.scss";

const OtpSuccessOverlay = () => (
  <div className={styles.overlay}>
    <div className={styles.circle}>
      <svg viewBox="0 0 52 52" className={styles.svg}>
        <circle cx="26" cy="26" r="25" className={styles.bg} />
        <path d="M14 26 L22 34 L38 18" className={styles.check} />
      </svg>
    </div>
  </div>
);

export default OtpSuccessOverlay;