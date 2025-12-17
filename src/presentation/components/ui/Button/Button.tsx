import styles from './Button.module.scss';
import type { ButtonProps } from '@/lib/types';

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', loading = false, disabled, className = '', ...rest }) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${className}`}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? (
                <span className={styles.spinner}></span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;