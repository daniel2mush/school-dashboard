import { forwardRef, type ReactNode } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth, leftIcon, className = '', ...props }, ref) => {
    const containerClasses = ['form-group', fullWidth ? 'fullWidth' : '']
      .filter(Boolean)
      .join(' ')

    const inputClasses = [
      'input',
      error ? 'has-error' : '',
      leftIcon ? 'has-left-icon' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={containerClasses}>
        {label && <label className="form-label">{label}</label>}
        <div className="input-wrapper">
          {leftIcon && <div className="input-left-icon">{leftIcon}</div>}
          <input ref={ref} className={inputClasses} {...props} />
        </div>
        {error && <span className="error-text">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
