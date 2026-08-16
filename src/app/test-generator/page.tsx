"use client";

import { useState } from "react";
import { FileSignature, Sparkles, Download, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

interface TestQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export default function TestGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{questions: TestQuestion[]} | null>(null);

  const [formData, setFormData] = useState({
    grade: "",
    subject: "",
    topic: "",
    questionsCount: "5",
    difficulty: "O'rta"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Xatolik yuz berdi");

      const data = await response.json();
      setResult(data);
    } catch {
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("TEST SAVOLLARI", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Fan: ${formData.subject} | Sinf: ${formData.grade}`, 20, 30);
    doc.text(`Mavzu: ${formData.topic}`, 20, 40);

    let yPos = 55;

    result.questions.forEach((q, i) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      const splitQuestion = doc.splitTextToSize(`${i + 1}. ${q.question}`, 170);
      doc.text(splitQuestion, 20, yPos);
      yPos += (splitQuestion.length * 7) + 2;

      doc.setFontSize(11);
      q.options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        doc.text(`${letter}) ${opt}`, 25, yPos);
        yPos += 7;
      });

      yPos += 5;
    });

    doc.save(`testlar-${formData.topic}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm">
          <FileSignature className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Test Yaratuvchi</h1>
          <p className="text-slate-500 dark:text-slate-400">Istalgan mavzuda bir necha soniyada test savollari tayyorlang</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Fan"
              type="text" required
              placeholder="Masalan: Biologiya"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
            <Input
              label="Sinf"
              type="text" required
              placeholder="Masalan: 8"
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
            />
            <Input
              label="Mavzu"
              type="text" required
              placeholder="Masalan: Yurak"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Savollar"
                type="number" required max="20" min="1"
                value={formData.questionsCount}
                onChange={(e) => setFormData({...formData, questionsCount: e.target.value})}
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Qiyinlik</label>
                <select
                  className="w-full px-5 py-3.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 border-white/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-primary transition-all duration-300 shadow-inner"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option value="Oson">Oson</option>
                  <option value="O'rta">O&apos;rta</option>
                  <option value="Qiyin">Qiyin</option>
                </select>
              </div>
            </div>

            <Button type="submit" isLoading={loading} leftIcon={<Sparkles className="w-5 h-5" />} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Yaratilmoqda..." : "Test yaratish"}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2 p-0 flex flex-col h-[calc(100vh-14rem)] overflow-hidden">
          {result ? (
            <div className="flex flex-col h-full animate-in fade-in duration-500">
              <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Natija: {result.questions.length} ta savol
                </h2>
                <Button variant="outline" onClick={downloadPDF} leftIcon={<Download className="w-4 h-4" />} className="h-9 text-sm">
                  <span className="hidden sm:inline">PDF yuklash</span>
                </Button>
              </div>

              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-800/30">
                {result.questions.map((q, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4 pl-2 flex gap-3">
                      <span className="text-indigo-500 font-bold">{i + 1}.</span>
                      {q.question}
                    </h3>

                    <div className="space-y-3 pl-8">
                      {q.options.map((opt, idx) => {
                        const isCorrect = opt === q.correct_answer;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-medium'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isCorrect ? 'bg-emerald-200 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 pl-8 text-sm">
                      <div className="inline-flex items-start gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg">
                        <span className="font-semibold shrink-0">Izoh:</span> <span className="dark:text-blue-300/80">{q.explanation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center h-full animate-pulse">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400 dark:text-indigo-400" />
              </div>
              <p>AI test savollarini tayyorlamoqda...</p>
            </div>
          ) : (
            <EmptyState
              icon={FileSignature}
              title="Test tayyor emas"
              description="Chap tomondagi formani to'ldiring va test savollarini kuting."
              className="flex-1 h-full border-none bg-transparent justify-center"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
