import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-bold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`
            w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border-2 border-white/60 rounded-2xl 
            text-slate-800 placeholder-slate-400 font-medium
            focus:outline-none focus:bg-white focus:border-violet-400 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)]
            transition-all duration-300 shadow-inner group-hover:bg-white/80
            ${error ? "border-red-300 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)]" : ""} 
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-500 ml-1 mt-0.5">{error}</span>}
    </div>
  );
};
