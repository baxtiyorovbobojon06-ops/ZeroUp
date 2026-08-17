import { Skeleton } from "@/components/ui/Skeleton";

interface StatsRowProps {
  loading: boolean;
  studentCount: number;
  testCount: number;
  attemptCount: number;
  avgPercentage: number;
}

export function StatsRow({ loading, studentCount, testCount, attemptCount, avgPercentage }: StatsRowProps) {
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
    { label: "Tekshirilgan varaqalar", value: attemptCount, suffix: "" },
    { label: "O'rtacha natija", value: avgPercentage, suffix: "%" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1 p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)]"
        >
          <p className="text-xl font-medium text-[var(--text-primary)]">
            {item.value}{item.suffix}
          </p>
          <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
