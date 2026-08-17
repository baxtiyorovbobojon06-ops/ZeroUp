"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ReportStats, ReportAiAnalysis } from "@/lib/types/report";

type StatsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: ReportStats };

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: ReportAiAnalysis };

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-medium text-[var(--text-primary)]">{value}</p>
    </Card>
  );
}

export default function ReportStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsState>({ status: "loading" });
  const [lowExpanded, setLowExpanded] = useState(false);
  const [ai, setAi] = useState<AiState>({ status: "idle" });

  const fetchStats = useCallback(() => {
    fetch("/api/report")
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data: ReportStats) => setStats({ status: "ready", data }))
      .catch(() => setStats({ status: "error" }));
  }, []);

  const retryStats = useCallback(() => {
    setStats({ status: "loading" });
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const runAiAnalysis = useCallback(() => {
    setAi({ status: "loading" });
    fetch("/api/report/ai-analysis")
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data: ReportAiAnalysis) => setAi({ status: "ready", data }))
      .catch(() => setAi({ status: "error" }));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium text-[var(--text-primary)]">Hisobot</h1>
      </div>

      {stats.status === "loading" && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[var(--radius-card)]" />
          ))}
        </div>
      )}

      {stats.status === "error" && (
        <Card className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--danger-text)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Statistikani yuklab bo&apos;lmadi
          </div>
          <Button variant="secondary" onClick={retryStats} className="shrink-0 py-1.5 px-3 text-sm">
            Qayta urinish
          </Button>
        </Card>
      )}

      {stats.status === "ready" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="O'quvchilar soni" value={String(stats.data.oquvchilarSoni)} />
            <StatCard label="Davomat foizi" value={`${stats.data.davomatFoizi}%`} />
            <StatCard label="Tekshirilgan varaqlar" value={String(stats.data.tekshirilganVaraqlar)} />
            <StatCard label="O'zlashtirish foizi" value={`${stats.data.ozlashtirishFoizi}%`} />
          </div>

          {stats.data.pastOzlashtirganlar.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <button
                onClick={() => setLowExpanded((v) => !v)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--danger-text)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    {stats.data.pastOzlashtirganlar.length} ta o&apos;quvchi qo&apos;shimcha e&apos;tibor talab qiladi
                  </span>
                </div>
                <ChevronDown
                  className="w-4 h-4 text-[var(--text-muted)] transition-transform shrink-0"
                  style={{ transform: lowExpanded ? "rotate(180deg)" : "none" }}
                />
              </button>
              {lowExpanded && (
                <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                  {stats.data.pastOzlashtirganlar.map((s) => (
                    <div key={s.studentId} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{s.ism}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.sabab}</p>
                      </div>
                      <span
                        className="text-sm font-medium px-2 py-1 rounded shrink-0"
                        style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}
                      >
                        {s.ozlashtirishFoizi}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            <h3 className="font-medium text-[var(--text-primary)]">AI Tahlili</h3>
          </div>
          {ai.status !== "loading" && (
            <Button onClick={runAiAnalysis} className="py-1.5 px-3 text-sm">
              {ai.status === "ready" || ai.status === "error" ? "Qayta tahlil qilish" : "Tahlil qilish"}
            </Button>
          )}
        </div>

        {ai.status === "loading" && (
          <p className="text-sm text-[var(--text-muted)] animate-pulse">AI tahlil qilyapti...</p>
        )}

        {ai.status === "error" && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[var(--danger-text)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Tahlil qilib bo&apos;lmadi, qayta urinib ko&apos;ring
            </div>
            <Button variant="secondary" onClick={runAiAnalysis} className="shrink-0 py-1.5 px-3 text-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {ai.status === "ready" && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">{ai.data.metodikaTahlili}</p>
            {ai.data.etiborKerakOquvchilar.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">E&apos;tibor kerak o&apos;quvchilar</p>
                {ai.data.etiborKerakOquvchilar.map((s, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-[var(--radius)]"
                    style={{ background: "var(--accent-bg-tint)" }}
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)]">{s.ism}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{s.sabab}</p>
                    <p className="text-xs text-[var(--accent-primary-hover)] mt-1">{s.tavsiya}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
