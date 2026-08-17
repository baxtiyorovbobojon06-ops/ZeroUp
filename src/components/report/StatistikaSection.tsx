import { Users, CalendarCheck2, FileCheck2, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export interface ReportStats {
  studentsCount: number;
  attendancePercent: number;
  checkedCount: number;
  masteryPercent: number;
}

interface StatistikaSectionProps {
  stats: ReportStats | null;
  loading: boolean;
  error: boolean;
}

export function StatistikaSection({ stats, loading, error }: StatistikaSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-sm text-red-500 dark:text-red-400 py-4">
        Statistikani yuklab bo&apos;lmadi
      </div>
    );
  }

  const items = [
    { icon: Users, label: "O'quvchilar soni", value: stats?.studentsCount ?? 0, suffix: "" },
    { icon: CalendarCheck2, label: "Davomat foizi", value: stats?.attendancePercent ?? 0, suffix: "%" },
    { icon: FileCheck2, label: "Tekshirilgan varaqlar", value: stats?.checkedCount ?? 0, suffix: "" },
    { icon: TrendingUp, label: "O'zlashtirish foizi", value: stats?.masteryPercent ?? 0, suffix: "%" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => {
        const isEmpty = !item.value;
        return (
          <div
            key={item.label}
            className="flex flex-col items-center text-center gap-1.5 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <item.icon className={`w-5 h-5 ${isEmpty ? "text-slate-300 dark:text-slate-600" : "text-primary"}`} />
            <p className={`text-xl font-bold ${isEmpty ? "text-slate-300 dark:text-slate-600" : "text-slate-900 dark:text-slate-100"}`}>
              {item.value}{item.suffix}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
