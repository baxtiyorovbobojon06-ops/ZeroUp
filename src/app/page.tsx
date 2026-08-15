"use client";

import Link from "next/link";
import { Bell, BookOpen, CheckCircle2, BarChart2, ArrowRight, FileText, ChevronDown, CheckSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useSettings } from "@/contexts/SettingsContext";
import { mockTests } from "@/data/mockTests";

export default function Home() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const { notificationsEnabled, notificationsMuted } = useSettings();

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    setHasUnread(false);
  };

  return (
    <>
      <NotificationsDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out relative pb-8 max-w-[1400px] mx-auto overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Xush kelibsiz, Malika opa! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Bugun qanday yordam kerak?</p>
        </div>

        <button 
          onClick={handleOpenNotifications}
          className="relative p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300 group"
        >
          {notificationsEnabled && !notificationsMuted && hasUnread && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm z-10">
              3
            </span>
          )}
          <Bell className="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* 4 Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Dars Rejasi */}
        <div className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">AI Dars Rejasi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Fan va mavzuni kiriting, to'liq dars rejani oling.
            </p>
          </div>
          <Link href="/lesson-planner" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
            Dars rejasi yaratish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Test Yaratuvchi */}
        <div className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">AI Test Yaratuvchi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Istalgan mavzu bo'yicha testlar yarating.
            </p>
          </div>
          <Link href="/test-generator" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
            Test yaratish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Javob Tekshiruvchi */}
        <div className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">AI Javob Tekshiruvchi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Rasm yoki fayl yuklang, AI tekshirib baho beradi.
            </p>
          </div>
          <Link href="/grader" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
            Tekshirishni boshlash <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 4: Hisobot */}
        <div className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">AI Hisobot</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Natijalar va davomat asosida analitik hisobot oling.
            </p>
          </div>
          <Link href="/report" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
            Hisobot yaratish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Bottom Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        
        {/* Left Column: Recent Activity */}
        <div className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">So'nggi faoliyatlar</h2>
          
          <div className="flex-1 space-y-4">
            {mockTests.slice(0, 4).map((test) => (
              <Link key={test.id} href={`/saved-tests/${test.id}`} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 p-1 -m-1 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-indigo-600 transition-colors">
                    {test.grade} {test.subject} - {test.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.timeAgo}</p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-full shrink-0">
                  Test
                </span>
              </Link>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link href="#" className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center justify-center gap-1 hover:underline">
              Barchasini ko'rish <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Quick Statistics */}
        <div className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tezkor statistika</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Bu oy <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">12</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Dars rejalari</p>
            </div>
            
            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">8</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Yaratilgan testlar</p>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">153</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tekshirilgan javoblar</p>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-lg flex items-center justify-center mb-3">
                <BarChart2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">4</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Yaratilgan hisobotlar</p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-auto">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">O'quvchilar bo'yicha umumiy</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">O'rtacha natija</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">78%</span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }}></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Eng yuqori: <span className="text-emerald-500 font-bold">96%</span></span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Eng past: <span className="text-rose-500 font-bold">45%</span></span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs text-slate-400 font-medium">© 2024 MaktabAI. Barcha huquqlar himoyalangan.</p>
      </div>

    </div>
    </>
  );
}
