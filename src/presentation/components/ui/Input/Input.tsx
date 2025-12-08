import styles from './Input.module.scss';
import type { InputProps } from '@/shared/types';

const Input = ({ label, error, className, disabled, ...inputProps }: InputProps) => {
    return (
        <div className={styles.field}>
            <label className={styles.label}>
                {label}
            </label>

            <input
                className={`${styles.input} ${error ? styles.hasError : ''} ${className || ''}`}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputProps.id}-error` : undefined}
                {...inputProps}
            />

            {error && (
                <span
                    id={`${inputProps.id}-error`}
                    className={styles.error}
                    role="alert"
                >
                    {error}
                </span>
            )}
        </div>
    );
}

export default Input