import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatsRowProps {
  loading: boolean;
  studentCount: number;
  testCount: number;
  checkedTestCount: number;
  avgPercentage: number;
  onAvgClick?: () => void;
  avgExpanded?: boolean;
}

export function StatsRow({ loading, studentCount, testCount, checkedTestCount, avgPercentage, onAvgClick, avgExpanded }: StatsRowProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Jami o'quvchilar", value: studentCount, suffix: "" },
    { label: "Testlar", value: testCount, suffix: "" },
    { label: "Tekshirilgan testlar", value: checkedTestCount, suffix: "" },
    { label: "O'rtacha natija", value: avgPercentage, suffix: "%", clickable: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const cardClassName = "flex flex-col gap-1 p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)]";

        if (item.clickable && onAvgClick) {
          return (
            <button key={item.label} onClick={onAvgClick} className={`${cardClassName} text-left`}>
              <div className="flex items-center justify-between">
                <p className="text-xl font-medium text-[var(--text-primary)]">
                  {item.value}{item.suffix}
                </p>
                <ChevronDown
                  className="w-4 h-4 text-[var(--text-muted)] transition-transform shrink-0"
                  style={{ transform: avgExpanded ? "rotate(180deg)" : "none" }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
            </button>
          );
        }

        return (
          <div key={item.label} className={cardClassName}>
            <p className="text-xl font-medium text-[var(--text-primary)]">
              {item.value}{item.suffix}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
