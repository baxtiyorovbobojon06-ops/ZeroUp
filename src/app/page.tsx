"use client";

import Link from "next/link";
import { Bell, Calendar, FileText, CheckSquare, PieChart, Plus, Sparkles, Edit } from "lucide-react";
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out relative pb-10">
      <NotificationsDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Salom, O'qituvchi! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Bugun qanday ishlarni avtomatlashtiramiz?</p>
        </div>

        <button 
          onClick={handleOpenNotifications}
          className="flex items-center gap-3 group"
        >
          {notificationsEnabled && !notificationsMuted && hasUnread && (
            <div className="hidden sm:flex items-center bg-rose-50/80 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 px-4 py-2.5 rounded-2xl border border-rose-100 dark:border-rose-800/30 shadow-sm group-hover:-translate-y-1 transition-all">
              <span className="text-sm font-medium truncate max-w-[200px]">
                Yangi: Test javoblari tekshirildi...
              </span>
            </div>
          )}
          
          <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all rounded-2xl text-slate-600 dark:text-slate-300">
            <Bell className="w-6 h-6 group-hover:text-rose-500 transition-colors" />
          </div>
        </button>
      </div>

      {/* Top Row: Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#66d9e8] text-[#0b7285] p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <Calendar className="w-5 h-5" />
            <h3>Bugungi Darslar</h3>
          </div>
          <p className="text-sm font-medium mb-3">3 ta dars rejalashtirilgan</p>
          <div className="bg-white/30 rounded-xl p-3 text-sm space-y-1">
            <p>8-A Biologiya (10:00)</p>
            <p>9-B Fizika (12:00)</p>
            <p>7-C Matematika (14:00)</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#8ce99a] text-[#2b8a3e] p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <FileText className="w-5 h-5" />
            <h3>Yaratilgan Materiallar</h3>
          </div>
          <p className="text-sm font-medium leading-relaxed mt-4">
            Joriy oyda: <br/> 
            <span className="text-base font-bold">12 ta dars rejasi,<br/> 8 ta test</span>
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#b197fc] text-[#5f3dc4] p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <CheckSquare className="w-5 h-5" />
            <h3>Tekshirilmagan Vazifalar</h3>
          </div>
          <p className="text-sm font-medium mt-4 mb-4 leading-relaxed">
            <span className="text-base font-bold">7 ta</span> o'quvchi ishi<br/>tekshirishni kutmoqda
          </p>
          <Link href="/grader" className="text-sm underline font-semibold hover:text-[#4c2b9a] transition-colors">
            Link to Tekshirish
          </Link>
        </div>

        {/* Card 4 */}
        <div className="bg-[#ffd8a8] text-[#d9480f] p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center gap-2 font-semibold mb-3">
            <PieChart className="w-5 h-5" />
            <h3>Tezkor Statistika</h3>
          </div>
          <p className="text-sm font-medium mt-4 leading-relaxed">
            O'quvchilar faolligi: <br/>
            <span className="text-lg font-bold">85% o'rtacha 📈</span>
          </p>
        </div>
      </div>

      {/* Middle Row: Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Tezkor Harakatlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/lesson-planner" className="group">
            <div className="bg-[#5c4cfc] hover:bg-[#4a3ae6] text-white p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-sm">
              <Plus className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-lg tracking-wide">Yangi dars rejasi tuzish</span>
            </div>
          </Link>
          <Link href="/test-generator" className="group">
            <div className="bg-[#5c4cfc] hover:bg-[#4a3ae6] text-white p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-sm">
              <Sparkles className="w-6 h-6 text-yellow-300 opacity-90 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold text-lg tracking-wide">Tez test yaratish</span>
            </div>
          </Link>
          <Link href="/grader" className="group">
            <div className="bg-[#5c4cfc] hover:bg-[#4a3ae6] text-white p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-sm">
              <Edit className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-lg tracking-wide">Javob tekshirish</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Row: Recent Activity History */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Oxirgi Yaratilgan Testlar</h2>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 p-6 rounded-3xl shadow-sm">
          <ul className="space-y-4 text-slate-700 dark:text-slate-300 font-medium">
            {mockTests.map((test, index) => (
              <li key={test.id} className="group">
                <Link href={`/saved-tests/${test.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="text-slate-400 min-w-[24px]">{index + 1}.</span>
                  <span className="flex-1">{test.grade} {test.subject} - {test.title}</span>
                  <span className="text-sm text-slate-400">{test.timeAgo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
