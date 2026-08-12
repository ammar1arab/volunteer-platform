import styles from "./Textarea.module.scss";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea = ({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) => (
  <div className={styles.wrapper}>
    {label && (
      <label className={styles.label}>
        {label}
        {props.required && <span className={styles.required}>*</span>}
      </label>
    )}
    <textarea
      className={`${styles.textarea} ${error ? styles.textareaError : ""} ${className}`}
      {...props}
    />
    {error && <span className={styles.error}>{error}</span>}
  </div>
);

export default Textarea;
