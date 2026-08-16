"use client";

import Link from "next/link";
import { Bell, BookOpen, CheckCircle2, BarChart2, ArrowRight, FileText, ChevronDown, CheckSquare, Sparkles, Calendar, CalendarDays, CalendarRange, Clock, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useSettings } from "@/contexts/SettingsContext";
import { mockTests } from "@/data/mockTests";

export default function Home() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const { notificationsEnabled, notificationsMuted } = useSettings();

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const [savedTestIds, setSavedTestIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedTestIds');
    if (saved) {
      try {
        setSavedTestIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved tests', e);
      }
    }
  }, []);

  const toggleSaveTest = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSavedTestIds(prev => {
      const newSaved = prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id];
      localStorage.setItem('savedTestIds', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const timeLabels = {
    day: 'Bu kun',
    week: 'Bu hafta',
    month: 'Bu oy',
    year: 'Bu yil'
  };

  const statsData = {
    day: {
      lessons: 1,
      tests: 0,
      checked: 15,
      reports: 0,
      avg: 71,
      high: 88,
      low: 60
    },
    week: {
      lessons: 3,
      tests: 2,
      checked: 45,
      reports: 1,
      avg: 74,
      high: 92,
      low: 50
    },
    month: {
      lessons: 12,
      tests: 8,
      checked: 153,
      reports: 4,
      avg: 78,
      high: 96,
      low: 45
    },
    year: {
      lessons: 145,
      tests: 90,
      checked: 1850,
      reports: 42,
      avg: 82,
      high: 100,
      low: 55
    }
  };

  const currentStats = statsData[timeRange];

  const sortedMockTests = [...mockTests].sort((a, b) => {
    const aSaved = savedTestIds.includes(a.id);
    const bSaved = savedTestIds.includes(b.id);
    if (aSaved && !bSaved) return -1;
    if (!aSaved && bSaved) return 1;
    return 0;
  });

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">So&apos;nggi faoliyatlar</h2>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[310px] custom-scrollbar">
            {sortedMockTests.map((test) => {
              const isSaved = savedTestIds.includes(test.id);
              
              return (
                <Link key={test.id} href={`/saved-tests/${test.id}`} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 p-2 -m-2 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      {test.grade} {test.subject} - {test.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.timeAgo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button 
                      onClick={(e) => toggleSaveTest(e, test.id)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none"
                      title={isSaved ? "Saqlanganlardan olib tashlash" : "Saqlanganlarga qo'shish"}
                    >
                      <Star className={`w-4 h-4 transition-colors ${isSaved ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400 dark:hover:text-yellow-500'}`} />
                    </button>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                      Test
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Statistics */}
        <div className="bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-6 relative">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tezkor statistika</h2>
            
            <div className="relative">
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="bg-white dark:bg-slate-800 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-2 px-4 rounded-xl shadow-sm hover:shadow-md hover:border-violet-300 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <span>{timeLabels[timeRange]}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Custom Dropdown Menu */}
              {isTimeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTimeDropdownOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/60 dark:border-slate-700 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col space-y-1">
                      {[
                        { id: 'day', label: 'Bu kun', icon: Clock },
                        { id: 'week', label: 'Bu hafta', icon: Calendar },
                        { id: 'month', label: 'Bu oy', icon: CalendarDays },
                        { id: 'year', label: 'Bu yil', icon: CalendarRange }
                      ].map((option) => {
                        const isActive = timeRange === option.id;
                        const Icon = option.icon;
                        
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setTimeRange(option.id as 'day' | 'week' | 'month' | 'year');
                              setIsTimeDropdownOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative text-left w-full ${
                              isActive 
                                ? "bg-white shadow-sm border border-white/80" 
                                : "hover:bg-white/50 hover:translate-x-1"
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-violet-600 rounded-r-full shadow-glow"></div>
                            )}
                            <div className={`p-2 rounded-xl transition-all duration-300 shrink-0 ${
                              isActive 
                                ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                                : 'bg-white text-slate-500 shadow-sm border border-slate-100 group-hover:bg-violet-50 group-hover:text-violet-600 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-sm ${isActive ? 'font-bold text-violet-700 dark:text-violet-400' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4 Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-all duration-300">{currentStats.lessons}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Dars rejalari</p>
            </div>
            
            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-all duration-300">{currentStats.tests}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Yaratilgan testlar</p>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-all duration-300">{currentStats.checked}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tekshirilgan javoblar</p>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-lg flex items-center justify-center mb-3">
                <BarChart2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-all duration-300">{currentStats.reports}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Yaratilgan hisobotlar</p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-auto">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">O&apos;quvchilar bo&apos;yicha umumiy</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">O&apos;rtacha natija</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white transition-all duration-300">{currentStats.avg}%</span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${currentStats.avg}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Eng yuqori: <span className="text-emerald-500 font-bold transition-all duration-300">{currentStats.high}%</span></span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Eng past: <span className="text-rose-500 font-bold transition-all duration-300">{currentStats.low}%</span></span>
            </div>
          </div>

        </div>

      </div>

      {/* Saved Tests Section */}
      {savedTestIds.length > 0 && (
        <div className="mt-6 bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Saqlangan testlar</h2>
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-semibold ml-2">
              {savedTestIds.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTests.filter(test => savedTestIds.includes(test.id)).map((test) => (
              <Link key={`saved-${test.id}`} href={`/saved-tests/${test.id}`} className="flex items-center gap-4 group cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/40 dark:hover:bg-slate-700/80 p-3 rounded-2xl transition-colors border border-slate-100 dark:border-slate-700/50">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 fill-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                    {test.grade} {test.subject} - {test.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{test.timeAgo}</p>
                </div>
                <button 
                  onClick={(e) => toggleSaveTest(e, test.id)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-colors shadow-sm bg-slate-100 dark:bg-slate-700 shrink-0"
                  title="Saqlanganlardan olib tashlash"
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 hover:opacity-70 transition-opacity" />
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs text-slate-400 font-medium">© 2024 MaktabAI. Barcha huquqlar himoyalangan.</p>
      </div>

    </div>
    </>
  );
}
