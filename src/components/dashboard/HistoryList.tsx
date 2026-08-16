import { FileSignature } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface HistoryTestItem {
  id: string;
  title: string;
  date: string;
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
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
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
      <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">
        Hali test tarixi yo&apos;q
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tests.map((test) => (
        <div
          key={test.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <FileSignature className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{test.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(test.date).toLocaleDateString()} • {test._count?.attempts || 0} ta topshirilgan
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
