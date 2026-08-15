"use client";

import { useState } from "react";
import { CheckSquare, Sparkles, Loader2, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import toast from "react-hot-toast";

interface GraderResult {
  score: string;
  status: string;
  correct_parts: string[];
  mistakes: string[];
  feedback: string;
  recommendation: string;
}

export default function Grader() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraderResult | null>(null);

  const [formData, setFormData] = useState({
    assignment: "",
    student_answer: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/grader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Xatolik yuz berdi");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Javob Tekshiruvchi</h1>
          <p className="text-slate-500">O'quvchi javoblarini baholang va avtomatik feedback oling</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topshiriq sharti</label>
              <textarea 
                required rows={4}
                placeholder="Masalan: Kvadrat tenglamani yeching: x² - 5x + 6 = 0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                value={formData.assignment}
                onChange={(e) => setFormData({...formData, assignment: e.target.value})}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">O'quvchi javobi</label>
              <textarea 
                required rows={6}
                placeholder="Masalan: x1 = 2, x2 = 3"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                value={formData.student_answer}
                onChange={(e) => setFormData({...formData, student_answer: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Tekshirilmoqda..." : "Tekshirish va Baholash"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[500px]">
          {result ? (
            <div className="p-6 flex flex-col h-full animate-in slide-in-from-right-4 duration-500 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-emerald-800 mb-1">Yakuniy Baho</p>
                  <h2 className="text-3xl font-bold text-emerald-700">{result.score}</h2>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                  result.status === "To'g'ri" ? "bg-emerald-200 text-emerald-800" :
                  result.status === "Xato" ? "bg-red-200 text-red-800" :
                  "bg-amber-200 text-amber-800"
                }`}>
                  {result.status}
                </div>
              </div>

              {result.correct_parts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    To'g'ri bajarilgan qismlar
                  </h3>
                  <ul className="space-y-2">
                    {result.correct_parts.map((part, i) => (
                      <li key={i} className="flex gap-2 text-slate-700 text-sm">
                        <span className="text-emerald-500 font-bold">•</span>
                        {part}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.mistakes.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Xato va Kamchiliklar
                  </h3>
                  <ul className="space-y-2">
                    {result.mistakes.map((mistake, i) => (
                      <li key={i} className="flex gap-2 text-slate-700 text-sm">
                        <span className="text-red-500 font-bold">•</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Umumiy Xulosa</h3>
                <p className="text-slate-700 text-sm">{result.feedback}</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  Tavsiya
                </h3>
                <p className="text-blue-800 text-sm">{result.recommendation}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-full">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p>Topshiriq va o'quvchi javobini kiriting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
