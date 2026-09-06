import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    disabled,
    className = '',
    ...rest
}: ButtonProps) => {
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} disabled={disabled || loading} {...rest}>
            {loading ? (
                <span className={styles.spinner} />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
                    {children}
                    {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;