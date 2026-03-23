import styles from "./OtpCircularTimer.module.scss";

const R = 20;
const C = 2 * Math.PI * R;

const OtpCircularTimer = ({ seconds, total }: { seconds: number; total: number }) => {
    const offset = C * (1 - seconds / total);

    return (
        <div className={styles.wrap}>
            <svg width="52" height="52" viewBox="0 0 52 52" className={styles.svg}>
                <circle cx="26" cy="26" r={R} className={styles.track} />
                <circle
                    cx="26" cy="26" r={R}
                    className={styles.arc}
                    strokeDasharray={C}
                    strokeDashoffset={offset}
                    transform="rotate(-90 26 26)"
                />
            </svg>
            <span className={styles.label}>{seconds}</span>
        </div>
    );
};

export default OtpCircularTimer;