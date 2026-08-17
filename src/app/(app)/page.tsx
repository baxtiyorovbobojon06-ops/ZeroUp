"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Plus, Radio, ChevronDown, Users } from "lucide-react";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ClassDashboardStats } from "@/lib/types/dashboardStats";

interface TestItem {
  id: string;
  title: string;
  date: string;
  class?: { name: string } | null;
  _count?: { attempts: number };
}

interface ClassItem {
  id: string;
  name: string;
}

type ClassStatsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: ClassDashboardStats };

export default function Home() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [classPickerOpen, setClassPickerOpen] = useState(false);

  const [classStats, setClassStats] = useState<ClassStatsState>({ status: "loading" });
  const [chorakExpanded, setChorakExpanded] = useState(false);

  const [tests, setTests] = useState<TestItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);

  const fetchClassStats = useCallback((classId: string) => {
    Promise.resolve()
      .then(() => {
        setClassStats({ status: "loading" });
        setChorakExpanded(false);
      })
      .then(() => fetch(`/api/classes/${classId}/dashboard-stats`))
      .then(res => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: ClassDashboardStats) => setClassStats({ status: "ready", data }))
      .catch(() => setClassStats({ status: "error" }));
  }, []);

  useEffect(() => {
    fetch("/api/classes")
      .then(r => r.json())
      .then((data: ClassItem[]) => {
        setClasses(Array.isArray(data) ? data : []);
        setClassesLoading(false);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedClass(data[0]);
        }
      })
      .catch(() => setClassesLoading(false));

    fetch("/api/tests")
      .then(r => r.json())
      .then(data => {
        setTests(Array.isArray(data) ? data.slice(0, 5) : []);
        setTestsLoading(false);
      })
      .catch(() => setTestsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStats(selectedClass.id);
    }
  }, [selectedClass, fetchClassStats]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setClassPickerOpen(v => !v)}
            className="flex items-center gap-1.5"
            disabled={classes.length === 0}
          >
            <div className="text-left">
              <p className="text-xs text-[var(--text-muted)]">Sinflar statistikasi</p>
              <p className="text-lg font-medium text-[var(--text-primary)]">
                {classesLoading ? "..." : selectedClass ? selectedClass.name : "Sinflar yo'q"}
              </p>
            </div>
            {classes.length > 0 && (
              <ChevronDown
                className="w-4 h-4 text-[var(--text-muted)] transition-transform shrink-0"
                style={{ transform: classPickerOpen ? "rotate(180deg)" : "none" }}
              />
            )}
          </button>
        </div>

        {classPickerOpen && classes.length > 0 && (
          <div
            className="rounded-[var(--radius-card)] border-[0.5px] bg-[var(--card-bg)] overflow-hidden divide-y"
            style={{ borderColor: "var(--card-border)" }}
          >
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedClass(c); setClassPickerOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm"
                style={selectedClass?.id === c.id
                  ? { background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }
                  : { color: "var(--text-primary)", borderColor: "var(--card-border)" }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!classesLoading && classes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Hali sinflar yo'q"
          description="Statistikani ko'rish uchun avval sinf yarating."
          action={
            <Link href="/classes">
              <Button>Sinf yaratish</Button>
            </Link>
          }
        />
      ) : (
        <>
          <StatsRow
            loading={classesLoading || classStats.status === "loading"}
            studentCount={classStats.status === "ready" ? classStats.data.oquvchilarSoni : 0}
            testCount={classStats.status === "ready" ? classStats.data.testlarSoni : 0}
            checkedTestCount={classStats.status === "ready" ? classStats.data.tekshirilganTestlarSoni : 0}
            avgPercentage={classStats.status === "ready" ? classStats.data.ozlashtirishFoizi : 0}
            onAvgClick={classStats.status === "ready" ? () => setChorakExpanded(v => !v) : undefined}
            avgExpanded={chorakExpanded}
          />

          {classStats.status === "error" && (
            <Card className="p-4 text-sm text-[var(--danger-text)]">
              Statistikani yuklab bo&apos;lmadi
            </Card>
          )}

          {chorakExpanded && classStats.status === "ready" && (
            <Card className="p-0 overflow-hidden">
              <div className="grid grid-cols-4 divide-x" style={{ borderColor: "var(--card-border)" }}>
                {classStats.data.choraklar.map((ch) => (
                  <div key={ch.chorak} className="p-3 text-center">
                    <p className="text-[11px] text-[var(--text-muted)] mb-1">{ch.chorak}-chorak</p>
                    <p className="text-base font-medium text-[var(--text-primary)]">{ch.ozlashtirishFoizi}%</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{ch.testlarSoni} ta test</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/more/tests?new=1" className="block">
          <Button className="w-full" leftIcon={<Plus className="w-4 h-4" />}>Yangi test</Button>
        </Link>
        <Link href="/live" className="block">
          <Button className="w-full" variant="secondary" leftIcon={<Radio className="w-4 h-4" />}>Jonli test</Button>
        </Link>
      </div>

      <div>
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">So&apos;nggi testlar</h2>
        <HistoryList loading={testsLoading} tests={tests} />
      </div>
    </div>
  );
}
