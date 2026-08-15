import Link from "next/link";
import { BookOpen, FileSignature, CheckSquare, FileBarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Salom, O'qituvchi! 👋</h1>
        <p className="text-slate-500 mt-2 text-lg">Bugun qanday ishlarni avtomatlashtiramiz?</p>
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
