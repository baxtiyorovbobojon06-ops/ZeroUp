"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { Button } from "@/components/ui/Button";

interface TestItem {
  id: string;
  title: string;
  date: string;
  class?: { name: string } | null;
  _count?: { attempts: number };
}

interface Stats {
  studentCount: number;
  testCount: number;
  attemptCount: number;
  avgPercentage: number;
}

export default function Home() {
  const { profileName } = useSettings();

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [tests, setTests] = useState<TestItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));

    fetch("/api/tests")
      .then(r => r.json())
      .then(data => {
        setTests(Array.isArray(data) ? data.slice(0, 5) : []);
        setTestsLoading(false);
      })
      .catch(() => setTestsLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Xush kelibsiz</p>
          <p className="text-lg font-medium text-[var(--text-primary)]">{profileName}</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-medium shrink-0"
          style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}
        >
          {profileName ? profileName.charAt(0).toUpperCase() : "O'"}
        </div>
      </div>

      <StatsRow
        loading={statsLoading}
        studentCount={stats?.studentCount || 0}
        testCount={stats?.testCount || 0}
        attemptCount={stats?.attemptCount || 0}
        avgPercentage={stats?.avgPercentage || 0}
      />

      <Link href="/more/tests?new=1" className="block">
        <Button className="w-full" leftIcon={<Plus className="w-4 h-4" />}>Yangi test</Button>
      </Link>

      <div>
        <h2 className="text-xs font-medium text-[var(--text-muted)] mb-3">So&apos;nggi testlar</h2>
        <HistoryList loading={testsLoading} tests={tests} />
      </div>
    </div>
  );
}
