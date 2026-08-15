"use client";

import Link from "next/link";
import { BookOpen, FileSignature, CheckSquare, FileBarChart, Bell } from "lucide-react";
import { useState } from "react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notificationsEnabled } = useSettings();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out relative">
      <NotificationsDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Salom, O'qituvchi! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Bugun qanday ishlarni avtomatlashtiramiz?</p>
        </div>

        <button 
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all rounded-2xl text-slate-600 dark:text-slate-300 group"
        >
          <Bell className="w-6 h-6 group-hover:text-rose-500 transition-colors" />
          {notificationsEnabled && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lesson Planner */}
        <Link href="/lesson-planner" className="group block">
          <div className="glass-panel p-6 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-glow hover:-translate-y-2 relative overflow-hidden group-hover:border-white/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">AI Dars Rejasi</h2>
            <p className="text-slate-600">Fan va mavzuni kiriting, AI siz uchun to'liq dars rejasini ishlab chiqadi.</p>
          </div>
        </Link>

        {/* Test Generator */}
        <Link href="/test-generator" className="group block">
          <div className="glass-panel p-6 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-glow hover:-translate-y-2 relative overflow-hidden group-hover:border-white/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <FileSignature className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">AI Test Yaratuvchi</h2>
            <p className="text-slate-600">Istalgan mavzuda bir necha soniyada test savollari va javoblarini tayyorlang.</p>
          </div>
        </Link>

        {/* AI Grader */}
        <Link href="/grader" className="group block">
          <div className="glass-panel p-6 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-glow hover:-translate-y-2 relative overflow-hidden group-hover:border-white/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">AI Javob Tekshiruvchi</h2>
            <p className="text-slate-600">O'quvchilar javobini avtomatik tekshirib, xato va tavsiyalar bilan baholang.</p>
          </div>
        </Link>

        {/* AI Report Generator */}
        <Link href="/report" className="group block">
          <div className="glass-panel p-6 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-glow hover:-translate-y-2 relative overflow-hidden group-hover:border-white/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4">
              <FileBarChart className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">AI Hisobot</h2>
            <p className="text-slate-600">Davomat va o'zlashtirish haqida qisqacha ma'lumotdan to'liq dars hisoboti oling.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
