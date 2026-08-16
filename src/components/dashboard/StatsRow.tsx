import { FileSignature, CheckCircle2, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatsRowProps {
  loading: boolean;
  testCount: number;
  attemptCount: number;
  avgPercentage: number;
}

export function StatsRow({ loading, testCount, attemptCount, avgPercentage }: StatsRowProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = [
    { icon: FileSignature, label: "Testlar", value: testCount, suffix: "" },
    { icon: CheckCircle2, label: "Tekshirilgan", value: attemptCount, suffix: "" },
    { icon: BarChart2, label: "O'rtacha", value: avgPercentage, suffix: "%" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
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
