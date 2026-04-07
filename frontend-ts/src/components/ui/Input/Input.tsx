import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth, className = "", ...props }, ref) => {
    const containerClasses = ["form-group", fullWidth ? "fullWidth" : ""]
      .filter(Boolean)
      .join(" ");

    const inputClasses = ["input", error ? "has-error" : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        {label && <label className="form-label">{label}</label>}
        <div className="input-wrapper">
          <input ref={ref} className={inputClasses} {...props} />
        </div>
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
