"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CheckSquare, FileSignature, ArrowRight } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { HeroClassCard } from "@/components/dashboard/HeroClassCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { HistoryList } from "@/components/dashboard/HistoryList";

interface ClassItem {
  id: string;
  name: string;
  _count?: { students: number };
}

interface TestItem {
  id: string;
  title: string;
  date: string;
  _count?: { attempts: number };
}

interface Stats {
  testCount: number;
  attemptCount: number;
  avgPercentage: number;
}

export default function Home() {
  const { profileName } = useSettings();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const [tests, setTests] = useState<TestItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then(r => r.json())
      .then(data => {
        setClasses(Array.isArray(data) ? data : []);
        setClassesLoading(false);
      })
      .catch(() => {
        setClassesError(true);
        setClassesLoading(false);
      });

    fetch("/api/stats")
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsError(true);
        setStatsLoading(false);
      });

    fetch("/api/tests")
      .then(r => r.json())
      .then(data => {
        setTests(Array.isArray(data) ? data.slice(0, 3) : []);
        setTestsLoading(false);
      })
      .catch(() => {
        setTestsError(true);
        setTestsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Salom, {profileName} 👋</h1>

      {classesError ? (
        <div className="rounded-3xl border border-dashed border-red-200 dark:border-red-500/30 p-6 text-center text-sm text-red-500 dark:text-red-400">
          Sinflarni yuklab bo&apos;lmadi
        </div>
      ) : (
        <HeroClassCard loading={classesLoading} classItem={classes[0] || null} hasMultiple={classes.length > 1} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard
          icon={CheckSquare}
          label="Tekshirish"
          href="/grader"
          colorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <QuickActionCard
          icon={FileSignature}
          label="Test"
          href="/tests"
          colorClass="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Statistika</h2>
        {statsError ? (
          <div className="text-center text-sm text-red-500 dark:text-red-400 py-4">Statistikani yuklab bo&apos;lmadi</div>
        ) : (
          <StatsRow
            loading={statsLoading}
            testCount={stats?.testCount || 0}
            attemptCount={stats?.attemptCount || 0}
            avgPercentage={stats?.avgPercentage || 0}
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tarix</h2>
          <Link href="/tests" className="text-xs font-semibold text-primary hover:opacity-80 flex items-center gap-1">
            Barchasi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {testsError ? (
          <div className="text-center text-sm text-red-500 dark:text-red-400 py-4">Tarixni yuklab bo&apos;lmadi</div>
        ) : (
          <HistoryList loading={testsLoading} tests={tests} />
        )}
      </div>
    </div>
  );
}
