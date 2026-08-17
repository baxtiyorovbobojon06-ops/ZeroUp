"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileBarChart, ArrowLeft, AlertCircle } from "lucide-react";
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

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function ReportContent() {
  const router = useRouter();
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
      <div className="py-10">
        <EmptyState
          icon={FileBarChart}
          title="Hisobot tanlanmagan"
          description="Hisobotni ko'rish uchun Testlar yoki Asosiy sahifadan biror testni tanlang."
          action={
            <Link href="/more/tests">
              <Button>Testlarga qaytish</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-1/2 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[var(--radius-card)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="py-10">
        <EmptyState icon={AlertCircle} title="Hisobot topilmadi" description="Ushbu test uchun hisobot ma'lumotlarini yuklab bo'lmadi." />
      </div>
    );
  }

  const report = data.reports?.[0];
  const attempts = data.attempts || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-[var(--text-secondary)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium text-[var(--text-primary)]">{data.title} - Hisobot</h1>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="Hali natijalar kiritilmagan"
          description={'Avval "Tekshirish" sahifasi orqali javob varaqalarini tekshiring.'}
          action={
            <Link href="/grader">
              <Button>Tekshirishga o&apos;tish</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">O&apos;rtacha natija</p>
              <p className="text-2xl font-medium text-[var(--text-primary)]">{report?.averageScore?.toFixed(1) || 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Eng baland ball</p>
              <p className="text-2xl font-medium" style={{ color: "var(--success-text)" }}>{report?.highestScore || 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Eng past ball</p>
              <p className="text-2xl font-medium" style={{ color: "var(--danger-text)" }}>{report?.lowestScore || 0}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Tekshirilgan</p>
              <p className="text-2xl font-medium text-[var(--text-primary)]">{attempts.length}</p>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b-[0.5px]" style={{ borderColor: "var(--card-border)" }}>
              <h3 className="font-medium text-[var(--text-primary)]">O&apos;quvchilar natijalari</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
              {attempts.map((attempt: ReportAttempt) => (
                <div key={attempt.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {attempt.student.firstName} {attempt.student.lastName}
                    </p>
                    {attempt.needsReview && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full" style={{ background: "var(--warning-bg)", color: "var(--warning-text)" }}>
                        <AlertCircle className="w-3 h-3" /> Ko&apos;rib chiqish kerak
                      </span>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      To&apos;g&apos;ri: {attempt.correctCount} • Xato: {attempt.incorrectCount}
                    </p>
                  </div>
                  <span className="text-sm font-medium px-2 py-1 rounded" style={{ background: "var(--accent-bg-tint)", color: "var(--accent-primary-hover)" }}>
                    {attempt.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium text-[var(--text-primary)] mb-3">Savollar bo&apos;yicha qiyinchilik</h3>
            <div className="grid grid-cols-5 gap-2">
              {heatmapRatios.map((correctRatio, i) => {
                let style: React.CSSProperties = { background: "var(--success-bg)", color: "var(--success-text)" };
                if (correctRatio < 0.4) style = { background: "var(--danger-bg)", color: "var(--danger-text)" };
                else if (correctRatio < 0.7) style = { background: "var(--warning-bg)", color: "var(--warning-text)" };

                return (
                  <div key={i} className="flex items-center justify-center p-2 rounded-lg" style={style}>
                    <span className="text-xs font-medium">{i + 1}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--danger-text)" }} /> Qiyin</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--warning-text)" }} /> O&apos;rta</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--success-text)" }} /> Oson</div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--text-muted)]">Yuklanmoqda...</div>}>
      <ReportContent />
    </Suspense>
  );
}
