"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, FileSignature, CheckSquare, BarChart2, ArrowRight, BookOpen, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface RecentTest {
  id: string;
  title: string;
  date: string;
  class?: { name: string };
  _count?: { attempts: number };
}

interface Stats {
  studentCount: number;
  testCount: number;
  attemptCount: number;
  avgPercentage: number;
  recentTests: RecentTest[];
}

export default function Home() {
  const router = useRouter();
  const { profileName } = useSettings();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Xush kelibsiz, {profileName} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bugun yana qanday ishlarni amalga oshiramiz?</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/grader" className="flex-1 sm:flex-none">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" leftIcon={<CheckSquare className="w-4 h-4" />}>
              Tekshirish
            </Button>
          </Link>
          <Link href="/tests" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full" leftIcon={<FileSignature className="w-4 h-4" />}>
              Yangi test
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="w-10 h-10 rounded-xl mb-3" />
              <Skeleton className="w-24 h-4 mb-3" />
              <Skeleton className="w-16 h-8" />
            </Card>
          ))
        ) : (
          <>
            <Card className="p-5 flex flex-col hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami o&apos;quvchilar</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.studentCount || 0}</p>
            </Card>

            <Card className="p-5 flex flex-col hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSignature className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Testlar</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.testCount || 0}</p>
            </Card>

            <Card className="p-5 flex flex-col hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tekshirilgan varaqalar</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.attemptCount || 0}</p>
            </Card>

            <Card className="p-5 flex flex-col hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">O&apos;rtacha natija</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.avgPercentage || 0}%</p>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              So&apos;nggi testlar
            </h2>
            <Link href="/tests" className="text-sm text-primary hover:opacity-80 font-medium flex items-center gap-1">
              Barchasi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-1/3 h-4" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              ))
            ) : !stats?.recentTests || stats.recentTests.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Hali testlar qo'shilmagan"
                description="Birinchi testingizni yarating va u shu yerda ko'rinadi."
                action={
                  <Link href="/tests">
                    <Button className="h-9 text-sm">Test qo&apos;shish</Button>
                  </Link>
                }
              />
            ) : (
              stats.recentTests.map((test: RecentTest) => (
                <div key={test.id} className="bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <FileSignature className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{test.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {test.class?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(test.date).toLocaleDateString()}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {test._count?.attempts || 0} topshirilgan
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/report?testId=${test.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto h-9 text-xs">Hisobot</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            Tezkor havolalar
          </h2>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push('/classes')}>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-1">Sinflarni boshqarish</h3>
              <p className="text-indigo-100 text-sm mb-4 opacity-90">Yangi sinf va o&apos;quvchilarni qo&apos;shing</p>
              <div className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                Boshlash <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push('/grader')}>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-1">Tezkor Tekshiruv</h3>
              <p className="text-emerald-100 text-sm mb-4 opacity-90">Javob varaqalarini telefon orqali tekshirish</p>
              <div className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors">
                Kamerani ochish <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
