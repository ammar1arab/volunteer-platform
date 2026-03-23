import styles from "./PasswordStrength.module.scss";

const getStrength = (p: string): 0 | 1 | 2 | 3 => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[0-9]/.test(p) && /[a-zA-Z]/.test(p)) s++;
  return s as 0 | 1 | 2 | 3;
};

const LABELS = ["", "ضعيفة", "متوسطة", "قوية"];
const CLASS  = ["", styles.weak, styles.medium, styles.strong];

const PasswordStrength = ({ password }: { password: string }) => {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.bars}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`${styles.bar} ${strength >= i ? CLASS[strength] : ""}`}
          />
        ))}
      </div>
      <span className={`${styles.label} ${CLASS[strength]}`}>{LABELS[strength]}</span>
    </div>
  );
};

export default PasswordStrength;