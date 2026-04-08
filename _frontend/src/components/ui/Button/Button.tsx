import { forwardRef } from "react";
import styles from "./Button.module.scss";

interface ButtonTypes extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonTypes>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth,
      loading,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const buttonClasses = [
      styles.btn,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : "",
      loading ? styles.loading : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className={styles.spinner} />}
        <span className={loading ? styles.contentHidden : ""}>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
