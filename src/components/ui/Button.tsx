import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "outline";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-primary hover:opacity-90 text-white shadow-lg hover:-translate-y-0.5 border border-white/20",
  outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  leftIcon,
  rightIcon,
  variant = "default",
  className = "",
  disabled,
  ...props
}) => {
  // Caller can still override colors entirely via className (bg-*/border-*)
  const isCustom = className.includes('bg-') || className.includes('border');

  return (
    <button
      className={`
        relative overflow-hidden flex items-center justify-center gap-2
        font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 transform active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
        ${isCustom ? className : `${VARIANT_CLASSES[variant]} ${className}`}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Glossy overlay effect for premium look */}
      {!isCustom && variant === "default" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-2xl"></div>
      )}
      
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </span>
    </button>
  );
};
