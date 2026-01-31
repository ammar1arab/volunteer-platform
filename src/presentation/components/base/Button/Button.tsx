import styles from './Button.module.scss';

import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

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