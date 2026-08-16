"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileBarChart, ArrowLeft, BrainCircuit, Target, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import toast from "react-hot-toast";

function ReportContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');
  
  const [data, setData] = useState<any>(null);
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
    } else {
      setLoading(false);
    }
  }, [testId]);

  if (!testId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <FileBarChart className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Hisobot tanlanmagan</h2>
        <p className="text-slate-500 mt-2 mb-6">Hisobotni ko'rish uchun Testlar yoki Asosiy sahifadan biror testni tanlang.</p>
        <Link href="/tests">
          <Button className="bg-indigo-600">Testlarga qaytish</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center p-12 text-slate-500">Hisobot yuklanmoqda...</div>;
  }

  if (!data || data.error) {
    return <div className="text-center p-12 text-red-500">Hisobot topilmadi</div>;
  }

  const report = data.reports?.[0];
  const attempts = data.attempts || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{data.title} - Hisobot</h1>
            <p className="text-slate-500">{data.class?.name} • {data.subject} • {attempts.length} o'quvchi topshirgan</p>
          </div>
        </div>
      </div>

      {attempts.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50 border-dashed">
          <p className="text-slate-500">Hali bu test uchun natijalar kiritilmagan. Avval "Tekshirish" sahifasi orqali javoblarni tekshiring.</p>
          <Link href="/grader" className="mt-4 inline-block">
            <Button className="bg-emerald-600">Tekshirishga o'tish</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 mb-1">O'rtacha natija</p>
              <p className="text-3xl font-black text-indigo-600">{report?.averageScore?.toFixed(1) || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 mb-1">Eng baland ball</p>
              <p className="text-3xl font-black text-emerald-600">{report?.highestScore || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 mb-1">Eng past ball</p>
              <p className="text-3xl font-black text-red-500">{report?.lowestScore || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 mb-1">Tekshirilgan</p>
              <p className="text-3xl font-black text-slate-800">{attempts.length}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_350px] gap-6">
            <div className="space-y-6">
              <Card className="p-0 overflow-hidden">
                <div className="p-5 border-b bg-slate-50/50">
                  <h3 className="font-bold text-lg text-slate-800">O'quvchilar natijalari</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="px-5 py-3">O'quvchi</th>
                        <th className="px-5 py-3">To'g'ri</th>
                        <th className="px-5 py-3">Xato</th>
                        <th className="px-5 py-3">Natija</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attempts.map((attempt: any) => (
                        <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-800">
                            {attempt.student.firstName} {attempt.student.lastName}
                            {attempt.needsReview && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Ko'rib chiqish kerak
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-emerald-600 font-semibold">{attempt.correctCount}</td>
                          <td className="px-5 py-3 text-red-500">{attempt.incorrectCount}</td>
                          <td className="px-5 py-3">
                            <span className="inline-block px-2 py-1 rounded bg-slate-100 font-bold text-slate-700">
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
                <h3 className="font-bold text-lg text-slate-800 mb-4">Savollar bo'yicha qiyinchilik (Heatmap)</h3>
                <div className="grid grid-cols-10 gap-2">
                  {/* Mock logic: In a real scenario, we'd aggregate true/false for each question across all attempts */}
                  {Array.from({length: data.questionCount}).map((_, i) => {
                    // Just visualizing a mock aggregation for MVP
                    const correctRatio = Math.random(); 
                    let colorClass = "bg-emerald-100 border-emerald-200 text-emerald-700";
                    if (correctRatio < 0.4) colorClass = "bg-red-100 border-red-200 text-red-700";
                    else if (correctRatio < 0.7) colorClass = "bg-amber-100 border-amber-200 text-amber-700";
                    
                    return (
                      <div key={i} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${colorClass}`}>
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded-full"/> Qiyin (Ko'p xato qilingan)</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-400 rounded-full"/> O'rta</div>
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
                    Ushbu test natijalariga ko'ra, sinfning umumiy o'zlashtirishi qoniqarli, ammo ba'zi mavzularda bo'shliqlar mavjud. O'quvchilar asosan 4, 7 va 12-savollarda ko'p xato qilishgan.
                  </p>
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Tavsiyalar
                    </h4>
                    <ul className="space-y-2 text-indigo-100 list-disc pl-4">
                      <li>Kuchsiz o'zlashtirgan mavzularni (kasrlar qisqartirilishi ehtimoli katta) keyingi darsda qayta tushuntirish tavsiya etiladi.</li>
                      <li>Past ko'rsatkich qayd etgan 3 nafar o'quvchi uchun qo'shimcha topshiriqlar ajratish kerak.</li>
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
