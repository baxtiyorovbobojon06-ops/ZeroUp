"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileSignature,
  CheckSquare,
  FileBarChart,
  Settings,
  Sparkles,
  Menu,
  X,
  Users
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const navItems = [
  { name: "Asosiy", href: "/", icon: LayoutDashboard },
  { name: "Sinflar", href: "/classes", icon: Users },
  { name: "Dars Rejasi", href: "/lesson-planner", icon: BookOpen },
  { name: "Testlar", href: "/tests", icon: FileSignature },
  { name: "Tekshirish", href: "/grader", icon: CheckSquare },
  { name: "Hisobot", href: "/report", icon: FileBarChart },
  { name: "Sozlanmalar", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { profileName, t } = useSettings();

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-transparent z-40 relative">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-primary truncate max-w-[120px]">
              {profileName} 👋
            </span>
          </div>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 hover:bg-white/50 rounded-xl transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop & Mobile) */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-72 md:w-[260px] glass-panel h-full flex flex-col shadow-2xl border-r md:border-r-0 md:border md:rounded-3xl border-white/60 overflow-hidden transform transition-transform duration-300 ease-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Header inside sidebar */}
        <div className="h-20 md:h-24 flex items-center justify-between px-6 md:px-8 border-b border-white/40">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:rotate-6 shrink-0">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-lg font-bold text-primary truncate">
                {profileName} 👋
              </span>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-400 hover:bg-white/50 hover:text-slate-700 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? "text-primary font-bold bg-white/60 dark:bg-slate-800/60 shadow-sm border border-white/80 dark:border-slate-700/80" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                )}
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg scale-110' 
                    : 'bg-white text-appicon shadow-sm border border-slate-100 group-hover:text-primary group-hover:shadow-md group-hover:border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:group-hover:bg-slate-700'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`${isActive ? 'font-bold' : 'font-medium'}`}>{t(item.name)}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-white/40 dark:border-slate-700/40 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md">
          <Link href="/settings" className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-white/80 dark:border-slate-700 shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <span className="text-sm font-bold text-primary">
                {profileName ? profileName.charAt(0).toUpperCase() : "O'"}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{profileName || "O'qituvchi"}</p>
              {/* Pullik tarif tizimi hali ishlab chiqilmagan — vaqtincha yashirilgan */}
              {/* <p className="text-xs font-semibold text-primary tracking-wide">{t("PRO TARIF")}</p> */}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
