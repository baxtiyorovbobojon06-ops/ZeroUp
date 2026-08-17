import React from "react";

export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-[var(--accent-bg-tint)] rounded-md ${className}`}></div>
  );
};
