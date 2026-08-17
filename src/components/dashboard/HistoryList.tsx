import Link from "next/link";
import { FileSignature } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

interface HistoryTestItem {
  id: string;
  title: string;
  date: string;
  class?: { name: string } | null;
  _count?: { attempts: number };
}

interface HistoryListProps {
  loading: boolean;
  tests: HistoryTestItem[];
}

export function HistoryList({ loading, tests }: HistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-card)] border-[0.5px] border-[var(--card-border)]">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="w-1/2 h-3.5" />
              <Skeleton className="w-1/3 h-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-muted)]">
        Hali test tarixi yo&apos;q
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tests.map((test) => (
        <div
          key={test.id}
          className="flex items-center gap-3 p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border-[0.5px] border-[var(--card-border)]"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg-tint)] flex items-center justify-center shrink-0">
            <FileSignature className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{test.title}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {test.class?.name ? `${test.class.name} • ` : ""}
              {new Date(test.date).toLocaleDateString()} • {test._count?.attempts || 0} ta topshirilgan
            </p>
          </div>
          <Link href={`/more/report?testId=${test.id}`}>
            <Button variant="secondary" className="text-xs px-3 py-1.5 shrink-0">Hisobot</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
