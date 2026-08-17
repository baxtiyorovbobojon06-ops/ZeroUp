import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)] rounded-[var(--radius-card)] p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
