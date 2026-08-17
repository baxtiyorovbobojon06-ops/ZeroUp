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
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-[var(--radius-card)] border border-dashed border-[var(--card-border)] ${className}`}>
      <div className="w-14 h-14 rounded-[var(--radius-card)] bg-[var(--accent-bg-tint)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--accent-primary)]" />
      </div>
      <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
