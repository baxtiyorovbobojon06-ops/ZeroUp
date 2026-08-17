import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white",
  secondary: "bg-transparent border border-[#9DBFD4] text-[var(--text-secondary)] hover:bg-[var(--accent-bg-tint)]",
  danger: "bg-transparent border border-[var(--danger-border)] text-[var(--danger-text)] hover:bg-[var(--danger-bg)]",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  leftIcon,
  rightIcon,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={`flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-[var(--radius)] transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
