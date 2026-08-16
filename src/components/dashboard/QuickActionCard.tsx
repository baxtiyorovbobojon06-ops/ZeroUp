import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  href: string;
  colorClass: string;
}

export function QuickActionCard({ icon: Icon, label, href, colorClass }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{label}</span>
    </Link>
  );
}
