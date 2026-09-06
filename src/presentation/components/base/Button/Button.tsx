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
    iconOnlyOnMobile?: boolean;
}

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    iconOnlyOnMobile = false,
    disabled,
    className = '',
    title,
    "aria-label": ariaLabel,
    ...rest
}: ButtonProps) => {
    const label = typeof children === "string" ? children : undefined;
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        icon && iconOnlyOnMobile && styles.iconOnlyOnMobile,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            title={title ?? (iconOnlyOnMobile ? label : undefined)}
            aria-label={ariaLabel ?? (iconOnlyOnMobile ? label : undefined)}
            {...rest}
        >
            {loading ? (
                <span className={styles.spinner} />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
                    <span className={icon && iconOnlyOnMobile ? styles.label : undefined}>{children}</span>
                    {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;