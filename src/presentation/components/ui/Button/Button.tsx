import styles from './Button.module.scss';
import type { ButtonProps } from '@/shared/types';

const Button = ({ children, loading = false, variant = 'primary', disabled, className, ...buttonProps }: ButtonProps) => {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${className || ''}`}
            disabled={disabled || loading}
            aria-busy={loading}
            {...buttonProps}
        >
            {loading ? (
                <span className={styles.spinner} aria-label="Loading" />
            ) : (
                children
            )}
        </button>
    );
}

export default Button