import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth, options, className = "", ...props }, ref) => {
    const containerClasses = ["form-group", fullWidth ? "fullWidth" : ""]
      .filter(Boolean)
      .join(" ");

    const selectClasses = ["select", error ? "has-error" : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        {label && <label className="form-label">{label}</label>}
        <div className="select-wrapper">
          <select ref={ref} className={selectClasses} {...props}>
            <option value="" disabled>
              Select an option
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";
