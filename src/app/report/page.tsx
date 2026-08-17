"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileBarChart, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatistikaSection, ReportStats } from "@/components/report/StatistikaSection";
import { LowPerformersSection, LowPerformer } from "@/components/report/LowPerformersSection";
import { AiAnalysisSection } from "@/components/report/AiAnalysisSection";
import Link from "next/link";
import toast from "react-hot-toast";

interface ReportAttempt {
  id: string;
  student: { firstName: string; lastName: string };
  correctCount: number;
  incorrectCount: number;
  percentage: number;
  needsReview: boolean;
}

interface ReportData {
  title: string;
  subject: string;
  questionCount: number;
  class?: { name: string };
  reports?: { averageScore: number; highestScore: number; lowestScore: number }[];
  attempts?: ReportAttempt[];
  error?: string;
}

// Deterministic pseudo-random value in [0, 1), so the mock heatmap doesn't
// reshuffle colors on every re-render (and stays a pure function of `seed`).
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function ReportContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [lowPerformers, setLowPerformers] = useState<LowPerformer[]>([]);

  useEffect(() => {
    if (testId) {
      fetch(`/api/reports?testId=${testId}`)
        .then(r => r.json())
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Xatolik yuz berdi");
          setLoading(false);
        });

      fetch(`/api/report?testId=${testId}`)
        .then(r => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(res => {
          setStats(res);
          setLowPerformers(Array.isArray(res.lowPerformers) ? res.lowPerformers : []);
          setStatsLoading(false);
        })
        .catch(() => {
          setStatsError(true);
          setStatsLoading(false);
        });
    }
  }, [testId]);

  const heatmapRatios = useMemo(
    () => Array.from({ length: data?.questionCount || 0 }, (_, i) => pseudoRandom(i + 1)),
    [data?.questionCount]
  );

  if (!testId) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={FileBarChart}
          title="Hisobot tanlanmagan"
          description="Hisobotni ko'rish uchun Testlar yoki Asosiy sahifadan biror testni tanlang."
          action={
            <Link href="/tests">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Testlarga qaytish</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-64 h-3" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="w-2/3 h-3 mb-3" />
              <Skeleton className="w-1/3 h-7" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <EmptyState icon={AlertCircle} title="Hisobot topilmadi" description="Ushbu test uchun hisobot ma'lumotlarini yuklab bo'lmadi." />
      </div>
    );
  }

  const attempts = data.attempts || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.title} - Hisobot</h1>
            <p className="text-slate-500 dark:text-slate-400">{data.class?.name} • {data.subject} • {attempts.length} o&apos;quvchi topshirgan</p>
          </div>
        </div>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="Hali natijalar kiritilmagan"
          description={'Avval "Tekshirish" sahifasi orqali javob varaqalarini tekshiring.'}
          action={
            <Link href="/grader">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Tekshirishga o&apos;tish</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div>
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Statistika</h2>
            <StatistikaSection stats={stats} loading={statsLoading} error={statsError} />
          </div>

          <LowPerformersSection students={lowPerformers} />

          <div className="grid lg:grid-cols-[1fr_350px] gap-6">
            <div className="space-y-6">
              <Card className="p-0 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">O&apos;quvchilar natijalari</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-100 dark:border-slate-700">
                      <tr>
                        <th className="px-5 py-3">O&apos;quvchi</th>
                        <th className="px-5 py-3">To&apos;g&apos;ri</th>
                        <th className="px-5 py-3">Xato</th>
                        <th className="px-5 py-3">Natija</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {attempts.map((attempt: ReportAttempt) => (
                        <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                            {attempt.student.firstName} {attempt.student.lastName}
                            {attempt.needsReview && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Ko&apos;rib chiqish kerak
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">{attempt.correctCount}</td>
                          <td className="px-5 py-3 text-red-500 dark:text-red-400">{attempt.incorrectCount}</td>
                          <td className="px-5 py-3">
                            <span className="inline-block px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200">
                              {attempt.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Heatmap Simulation (Question by Question overall stats) */}
              <Card className="p-5">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Savollar bo&apos;yicha qiyinchilik (Heatmap)</h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {/* Mock logic: In a real scenario, we'd aggregate true/false for each question across all attempts */}
                  {heatmapRatios.map((correctRatio, i) => {
                    // Just visualizing a mock aggregation for MVP
                    let colorClass = "bg-emerald-100 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
                    if (correctRatio < 0.4) colorClass = "bg-red-100 dark:bg-red-500/15 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400";
                    else if (correctRatio < 0.7) colorClass = "bg-amber-100 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400";

                    return (
                      <div key={i} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${colorClass}`}>
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded-full"/> Qiyin (Ko&apos;p xato qilingan)</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-400 rounded-full"/> O&apos;rta</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-400 rounded-full"/> Oson</div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <AiAnalysisSection testId={testId} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Yuklanmoqda...</div>}>
      <ReportContent />
    </Suspense>
  );
}
