"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileBarChart, ArrowLeft, BrainCircuit, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
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

  const report = data.reports?.[0];
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">O&apos;rtacha natija</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{report?.averageScore?.toFixed(1) || 0}</p>
            </Card>
            <Card className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Eng baland ball</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{report?.highestScore || 0}</p>
            </Card>
            <Card className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Eng past ball</p>
              <p className="text-3xl font-black text-red-500 dark:text-red-400">{report?.lowestScore || 0}</p>
            </Card>
            <Card className="p-5 flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tekshirilgan</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{attempts.length}</p>
            </Card>
          </div>

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
              <Card className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-6 h-6 text-indigo-200" />
                  <h3 className="font-bold text-lg">AI Pedagogik Tahlil</h3>
                </div>
                <div className="space-y-4 text-sm text-indigo-50 leading-relaxed">
                  <p>
                    Ushbu test natijalariga ko&apos;ra, sinfning umumiy o&apos;zlashtirishi qoniqarli, ammo ba&apos;zi mavzularda bo&apos;shliqlar mavjud. O&apos;quvchilar asosan 4, 7 va 12-savollarda ko&apos;p xato qilishgan.
                  </p>
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Tavsiyalar
                    </h4>
                    <ul className="space-y-2 text-indigo-100 list-disc pl-4">
                      <li>Kuchsiz o&apos;zlashtirgan mavzularni (kasrlar qisqartirilishi ehtimoli katta) keyingi darsda qayta tushuntirish tavsiya etiladi.</li>
                      <li>Past ko&apos;rsatkich qayd etgan 3 nafar o&apos;quvchi uchun qo&apos;shimcha topshiriqlar ajratish kerak.</li>
                    </ul>
                  </div>
                </div>
              </Card>
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
