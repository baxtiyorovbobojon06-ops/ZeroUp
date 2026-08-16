"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { mockTests } from "@/data/mockTests";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SavedTestsPage() {
  const { savedTestIds, toggleSaveTest } = useSettings();
  const savedTests = mockTests.filter(test => savedTestIds.includes(test.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-slate-200/50 dark:border-slate-700/50"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </Link>
        <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Saqlangan testlar
            <span className="text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 py-0.5 px-2.5 rounded-full">
              {savedTestIds.length}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Barcha o&apos;zingiz belgilagan testlar shu yerda turadi</p>
        </div>
      </div>

      {savedTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedTests.map((test) => (
            <Link key={`saved-${test.id}`} href={`/saved-tests/${test.id}`} className="group">
              <Card className="p-5 h-full flex flex-col hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 text-yellow-500 rounded-2xl flex items-center justify-center shadow-sm border border-yellow-100 dark:border-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-7 h-7 fill-yellow-400 drop-shadow-sm" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSaveTest(test.id);
                    }}
                    className="p-2.5 bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm z-10"
                    title="Saqlanganlardan olib tashlash"
                  >
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  </button>
                </div>

                <div className="flex-1">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-md mb-3 inline-block">
                    {test.grade} sinf
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {test.subject} - {test.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {test.questions.length} ta savol
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {test.timeAgo}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                    Ko&apos;rish &rarr;
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="Hozircha saqlangan testlar yo'q"
          description={'Testlarni saqlab qo\'yish uchun asosiy sahifadagi "So\'nggi faoliyatlar" bo\'limida joylashgan yulduzcha ustiga bosing.'}
          action={
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Asosiy sahifaga qaytish</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
