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
  X
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const navItems = [
  { name: "Asosiy", href: "/", icon: LayoutDashboard },
  { name: "Dars Rejasi", href: "/lesson-planner", icon: BookOpen },
  { name: "Testlar", href: "/test-generator", icon: FileSignature },
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
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/50 z-40 relative shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
            MaktabAI
          </span>
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 transform group-hover:rotate-6">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
              MaktabAI
            </span>
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
                    ? "text-violet-700 font-bold bg-white/60 shadow-sm border border-white/80" 
                    : "text-slate-600 hover:bg-white/40 hover:text-slate-900 hover:translate-x-1"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600 rounded-r-full shadow-glow"></div>
                )}
                <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive ? 'bg-violet-100/80 text-violet-600 shadow-sm' : 'bg-slate-100/50 text-slate-400 group-hover:bg-slate-200/50 dark:bg-slate-800/50 dark:group-hover:bg-slate-700/50'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {t(item.name)}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-white/40 dark:border-slate-700/40 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md">
          <Link href="/settings" className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center border border-white/80 shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <span className="text-sm font-bold text-violet-700">
                {profileName ? profileName.charAt(0).toUpperCase() : "O'"}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{profileName || "O'qituvchi"}</p>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 tracking-wide">{t("PRO TARIF")}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
