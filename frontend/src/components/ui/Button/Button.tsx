import { forwardRef } from 'react'

interface ButtonTypes extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  className?: string
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonTypes>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth,
      loading,
      className = '',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const buttonClasses = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth ? 'fullWidth' : '',
      loading ? 'loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="btn-spinner" />}
        <span className={loading ? 'btn-content' : ''}>{children}</span>
      </button>
    )
  },
)

Button.displayName = 'Button'
