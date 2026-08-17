import { useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface LowPerformer {
  id: string;
  name: string;
  percentage: number;
  reason: string;
}

interface LowPerformersSectionProps {
  students: LowPerformer[];
}

export function LowPerformersSection({ students }: LowPerformersSectionProps) {
  const [open, setOpen] = useState(false);

  if (students.length === 0) return null;

  return (
    <Card className="p-0 overflow-hidden border-amber-200 dark:border-amber-500/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {students.length} ta o&apos;quvchi qo&apos;shimcha e&apos;tibor talab qiladi
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
          Ko&apos;rish
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 animate-in fade-in duration-200">
          {students.map((student) => (
            <div key={student.id} className="p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{student.reason}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                {student.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
