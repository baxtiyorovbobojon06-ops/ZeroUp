import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-10 sm:p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
