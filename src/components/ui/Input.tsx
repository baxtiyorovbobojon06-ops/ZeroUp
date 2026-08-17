import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const fieldClasses = "w-full border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-[var(--radius)] px-2.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_2px_var(--accent-bg-tint)] placeholder:text-[var(--text-muted)]";

export const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        className={`${fieldClasses} ${error ? "border-[var(--danger-border)]" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--danger-text)]">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = "", children, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <select className={`${fieldClasses} ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
};
