import styles from './Input.module.scss';

export type InputDirMode = "auto" | "rtl" | "ltr";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  dirMode?: InputDirMode;
}

const detectDir = (type?: string) => {
  if (type === 'email' || type === 'password' || type === 'tel' || type === 'number' || type === 'url') return 'ltr';
  return 'rtl';
};

const Input: React.FC<InputProps> = ({ label, error, onChange, className = '', dirMode = 'auto', type, ...rest }) => {
  const dir = dirMode === 'auto' ? detectDir(type) : dirMode;

  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>
        {label}
        {rest.required && <span className={styles.required}>*</span>}
      </label>

      <input
        dir={dir}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
        onChange={onChange}
        type={type}
        {...rest}
      />

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;
